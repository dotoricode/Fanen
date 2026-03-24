# 파낸 (Fanen) — 트러블슈팅 가이드

> 마지막 업데이트: 2026-03-24 (v2)
> 개발 중 실제로 발생한 에러와 해결 방법을 기록한다.

---

## 목차

1. [Claude Code 스킬 인식 안 됨](#1-claude-code-스킬-인식-안-됨)
2. [pydantic-core 빌드 실패 (Python 3.14)](#2-pydantic-core-빌드-실패-python-314)
3. [supabase start — config.toml 파싱 에러](#3-supabase-start--configtoml-파싱-에러)
4. [supabase start — Docker daemon 연결 실패](#4-supabase-start--docker-daemon-연결-실패)
5. [supabase start — docker.sock 마운트 실패 (virtiofs)](#5-supabase-start--dockersock-마운트-실패-virtiofs)
6. [supabase db push — 프로젝트 ref 없음](#6-supabase-db-push--프로젝트-ref-없음)
7. [supabase link — DB 버전 불일치 경고](#7-supabase-link--db-버전-불일치-경고)
8. [Supabase 리전 변경 불가](#8-supabase-리전-변경-불가)

---

## 1. Claude Code 스킬 인식 안 됨

**증상**
```
Unknown skill: context-check
```

**원인**

스킬 파일 경로가 한 단계 더 중첩되어 있었음.

```
# 잘못된 경로
~/.claude/skills/context-check/context-check-skill/SKILL.md

# 올바른 경로
~/.claude/skills/context-check/SKILL.md
```

Claude Code는 `skills/<name>/SKILL.md` 구조만 인식한다.

**해결**

올바른 경로에 `SKILL.md`를 생성한다.

```bash
# 올바른 위치에 파일 생성 후 Claude Code 재시작
```

---

## 2. pydantic-core 빌드 실패 (Python 3.14)

**증상**
```
error: the configured Python interpreter version (3.14) is newer than
PyO3's maximum supported version (3.12)

ERROR: Failed building wheel for pydantic-core
```

**원인**

`pydantic-core 2.18.2`가 내부적으로 사용하는 PyO3 v0.21.1이 Python 3.12까지만 지원한다.
Python 3.14는 너무 최신이라 아직 지원하지 않는 패키지가 많다.

**해결**

Python 3.12로 venv를 재생성한다.

```bash
cd railway-api

rm -rf .venv
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**참고**: Railway 배포 시에도 Python 3.12를 사용하도록 `Dockerfile`에 명시할 것.

---

## 3. supabase start — config.toml 파싱 에러

**증상**
```
failed to parse config: decoding failed due to the following error(s):
'config.config' has invalid keys: project
```

**원인**

Supabase CLI 업데이트로 `[project]` 섹션이 폐기되었다.
`id`는 최상위 키 `project_id`로 변경되었다.

**해결**

`supabase/config.toml` 수정:

```toml
# 변경 전
[project]
id = "fanen"

# 변경 후
project_id = "fanen"
```

---

## 4. supabase start — Docker daemon 연결 실패

**증상**
```
failed to inspect service: Cannot connect to the Docker daemon at
unix:///Users/youngsang.kwon/.colima/default/docker.sock.
Is the docker daemon running?
```

**원인**

Colima가 실행되지 않은 상태.

**해결**

```bash
colima start
supabase start
```

**참고**: Colima는 macOS 재시작 시 자동으로 켜지지 않는다. 개발 시작 전 항상 확인할 것.

---

## 5. supabase start — docker.sock 마운트 실패 (virtiofs)

**증상**
```
failed to start docker container: Error response from daemon:
error while creating mount source path
'/Users/youngsang.kwon/.colima/default/docker.sock':
mkdir /Users/youngsang.kwon/.colima/default/docker.sock:
operation not supported
```

**원인**

Colima가 `virtiofs` 마운트 타입으로 실행 중일 때, Supabase CLI가
`DOCKER_HOST` 경로(`~/.colima/default/docker.sock`)를 컨테이너 내부에
bind mount하려 하면 virtiofs가 소켓 파일 마운트를 거부한다.

**해결**

1. `/var/run/docker.sock` 심링크 생성:
```bash
sudo ln -sf ~/.colima/default/docker.sock /var/run/docker.sock
```

2. `~/.zshrc`의 `DOCKER_HOST`를 심링크 경로로 변경:
```bash
# 변경 전
export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"

# 변경 후
export DOCKER_HOST="unix:///var/run/docker.sock"
```

3. 셸 재시작 후 `supabase start` 실행.

**핵심**: Docker 데몬이 VM 내부에서 `/var/run/docker.sock`을 표준 경로로
인식하기 때문에 virtiofs 제한을 우회할 수 있다.

---

## 6. supabase db push — 프로젝트 ref 없음

**증상**
```
Cannot find project ref. Have you run supabase link?
```

**원인**

`supabase link`를 한 번도 실행하지 않아 `.supabase/` 디렉토리가 없는 상태.

**해결**

프로젝트 ref는 `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`에서 추출 가능:
```
https://prynzbofjuiptsjzunby.supabase.co
         ↑ 이 부분이 프로젝트 ref
```

```bash
supabase link --project-ref <프로젝트_ref>
supabase db push
```

**참고**: `supabase projects list` 명령으로도 ref를 확인할 수 있으나,
`supabase login`(브라우저 인증)이 선행되어야 한다.

---

## 7. supabase link — DB 버전 불일치 경고

**증상**
```
WARNING: Local database version differs from the linked project.
Update your supabase/config.toml to fix it:
[db]
major_version = 17
```

**원인**

`supabase/config.toml`의 `major_version`이 로컬(15)과
원격 Supabase 프로젝트(17)가 다름.

**해결**

`supabase/config.toml` 수정:
```toml
[db]
major_version = 17  # 원격 프로젝트 버전에 맞게 수정
```

---

## 8. Supabase 리전 변경 불가

**증상**

대시보드에서 기존 프로젝트의 리전(예: ap-northeast-1 → ap-northeast-2)을
변경하는 옵션이 없음.

**원인**

Supabase는 **기존 프로젝트의 리전 변경을 지원하지 않는다.**

**해결**

새 프로젝트를 원하는 리전(Seoul: ap-northeast-2)으로 생성 후 마이그레이션:

```bash
# 1. 기존 데이터 백업
supabase db dump -f backup.sql --linked

# 2. 새 프로젝트로 링크 변경
supabase link --project-ref <새_프로젝트_ref>

# 3. 스키마 마이그레이션 적용
supabase db push

# 4. 데이터 복원 (필요 시)
psql <새_DB_URL> < backup.sql
```

5. `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를
   새 프로젝트 값으로 교체.

---

## 개발 환경 시작 체크리스트

매 개발 세션 시작 시 확인:

```bash
# 1. Colima 실행 확인
colima status

# 실행 안 되어 있으면
colima start

# 2. DOCKER_HOST 설정 확인 (미설정 시 ~/.zshrc에 추가)
echo $DOCKER_HOST

# 3. Supabase 로컬 서버 시작
supabase start

# 4. Next.js 개발 서버
npm run dev

# 5. FastAPI 개발 서버
cd railway-api && source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
