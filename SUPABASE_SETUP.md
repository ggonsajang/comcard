# ComCard - Supabase 백엔드 설정 가이드

## 🎯 개요

ComCard 앱이 이제 Supabase 백엔드를 지원합니다! 
앱과 웹에서 동일한 데이터를 공유할 수 있습니다.

---

## 📋 1단계: Supabase 프로젝트 생성

### 1. Supabase 계정 생성
1. [https://supabase.com](https://supabase.com) 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인

### 2. 새 프로젝트 생성
1. "New Project" 클릭
2. 프로젝트 이름 입력 (예: `comcard`)
3. Database Password 설정 (복잡한 비밀번호 자동생성됨)
4. Region: **Northeast Asia (Seoul)** 선택
5. "Create new project" 클릭
6. ⏳ 프로젝트 생성 대기 (1~2분 소요)

---

## 📋 2단계: 데이터베이스 테이블 생성

### 1. SQL Editor 열기
1. 좌측 메뉴에서 **SQL Editor** 클릭
2. "New Query" 클릭

### 2. 아래 SQL 코드 복사하여 실행

```sql
-- expenses 테이블 생성
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  workType TEXT NOT NULL,
  projectName TEXT,
  participants TEXT,
  remarks TEXT,
  receiptImage TEXT,
  createdAt BIGINT NOT NULL
);

-- 날짜순 인덱스 생성 (성능 향상)
CREATE INDEX idx_expenses_date ON expenses(date DESC);

-- Row Level Security (RLS) 비활성화 (간단한 앱이므로)
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
```

3. "Run" 버튼 클릭 (또는 Ctrl+Enter)
4. ✅ "Success. No rows returned" 메시지 확인

---

## 📋 3단계: API 키 가져오기

### 1. Project Settings 열기
1. 좌측 하단 **Settings (톱니바퀴 아이콘)** 클릭
2. **API** 메뉴 클릭

### 2. API 정보 복사
다음 두 가지 정보를 복사하세요:

1. **Project URL**
   - `Project URL` 항목 찾기
   - 예: `https://abcdefghij.supabase.co`
   - 📋 복사

2. **anon public Key**
   - `Project API keys` 섹션에서
   - `anon` `public` 키 찾기
   - 📋 복사 (매우 긴 문자열)

---

## 📋 4단계: 환경 변수 설정

### 1. .env.local 파일 수정
프로젝트 루트의 `.env.local` 파일을 열어서 복사한 값으로 교체:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://여기에_복사한_URL_붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_복사한_anon_key_붙여넣기

# 앱 패스워드
NEXT_PUBLIC_APP_PASSWORD=0213
```

### 2. 저장 후 서버 재시작
```bash
# 개발 서버 중지 (Ctrl+C)
# 다시 시작
npm run dev
```

---

## 🎉 5단계: 테스트

### 1. 앱 접속
1. 브라우저에서 `http://localhost:3000` 열기
2. 로그인 화면 확인
   - 패스워드: `0213`
   - 힌트: 여신님
3. 로그인 후 테스트 데이터 추가

### 2. 데이터 확인
Supabase 대시보드에서 확인:
1. **Table Editor** 메뉴 클릭
2. `expenses` 테이블 선택
3. 추가한 데이터가 보이는지 확인 ✅

### 3. 다른 기기에서 테스트
- 앱을 배포하면 (Vercel 등)
- 모바일 앱, 웹 브라우저 모두에서
- **같은 데이터**를 볼 수 있습니다!

---

## 🔧 문제 해결

### Supabase가 설정되지 않았을 때
- 앱은 자동으로 **localStorage**로 작동합니다
- 브라우저별로 데이터가 분리됩니다

### 데이터가 안 보일 때
1. 개발자 도구 (F12) → Console 탭 확인
2. Supabase 오류 메시지 확인
3. `.env.local` 파일 값이 올바른지 확인
4. 서버를 재시작했는지 확인

### RLS 오류가 발생할 때
```sql
-- SQL Editor에서 실행
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
```

---

## 📱 배포 (선택사항)

### Vercel 배포 시 환경 변수 설정
1. Vercel 프로젝트 설정
2. **Settings** → **Environment Variables**
3. 다음 3개 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_PASSWORD`

---

## 🎯 완료!

이제 ComCard가 클라우드 백엔드로 작동합니다! 🚀

- ✅ 앱/웹 데이터 동기화
- ✅ 패스워드 인증 (0213)
- ✅ 언제 어디서나 접속 가능
- ✅ 자동 백업

문제가 있으면 언제든 물어보세요! 😊
