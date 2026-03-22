# SchoolLife Sync Server for Vercel

SchoolLife의 아이폰/아이패드 간 시간표 수정, 코멘트, 알림 시각을 동기화하는 간단한 Vercel 서버입니다.

## 배포

1. 이 폴더를 GitHub에 올립니다.
2. Vercel에서 새 프로젝트를 만들고 Framework Preset은 `Other`로 둡니다.
3. Root Directory를 `performance-sync-vercel`로 설정합니다.
4. 환경변수 `BLOB_READ_WRITE_TOKEN`을 추가합니다.
5. 배포 후 `https://your-app.vercel.app/api/health`가 `ok: true`를 반환하는지 확인합니다.

## 필요한 Vercel 기능

- Vercel Blob
- Environment Variable: `BLOB_READ_WRITE_TOKEN`

## 앱에서 넣을 값

- 서버 URL 예시: `https://your-app.vercel.app`
- 동기화 키:
  - 첫 번째 기기에서 앱의 `새 동기화 키 만들기` 버튼으로 생성
  - 두 번째 기기에는 같은 서버 URL과 이 키를 넣고 `기존 키 연결`

## API

- `GET /api/bootstrap/current`
- `POST /api/bootstrap/create-or-get`
- `POST /api/sync/create`
- `POST /api/sync/pull`
- `POST /api/sync/push`
- `GET /api/health`

## 저장 방식

- 각 동기화 공간은 Blob에 JSON 문서 1개로 저장됩니다.
- 현재 공용 동기화 키는 별도 bootstrap 문서에 저장됩니다.
- 서버는 사용자 계정 시스템 없이 `동기화 키`로만 인증합니다.
- 충돌 시에는 최신 수정 시각을 우선합니다.
