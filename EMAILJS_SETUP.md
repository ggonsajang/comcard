# EmailJS 자동 이메일 발송 설정 가이드

## 📧 EmailJS로 자동 백업 이메일 보내기

EmailJS를 사용하면 사용자가 전송 버튼을 누르지 않아도 자동으로 이메일이 발송됩니다!

---

## 📋 1단계: EmailJS 계정 생성

1. **https://www.emailjs.com/** 접속
2. **Sign Up** 클릭 (무료)
3. 이메일로 계정 생성

---

## 📋 2단계: 이메일 서비스 연결

1. 로그인 후 **Email Services** 클릭
2. **Add New Service** 클릭
3. **Gmail** 선택 (또는 원하는 이메일 서비스)
4. **Connect Account** 클릭
5. 본인 Gmail 계정 연결 (ggonsajang@gmail.com 권장)
6. **Service ID**를 복사 (예: `service_abc1234`)

---

## 📋 3단계: 이메일 템플릿 생성

1. **Email Templates** 클릭
2. **Create New Template** 클릭
3. 템플릿 내용을 다음과 같이 설정:

### 템플릿 설정:

**Template Name**: `ComCard 백업`

**To Email**: 
```
{{to_email}}
```

**Subject**:
```
{{subject}}
```

**Message Body**:
```
{{message}}
```

4. **Save** 클릭
5. **Template ID**를 복사 (예: `template_xyz5678`)

---

## 📋 4단계: Public Key 가져오기

1. **Account** (우측 상단 프로필) 클릭
2. **API Keys** 탭 클릭
3. **Public Key**를 복사 (예: `A1B2C3D4E5F6G7H8I`)

---

## 📋 5단계: 환경 변수 설정

`.env.local` 파일을 열어서 복사한 값들을 입력:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc1234
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz5678
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=A1B2C3D4E5F6G7H8I
```

---

## 📋 6단계: 서버 재시작

```bash
# Ctrl+C로 서버 중지
npm run dev
```

---

## 🎉 완료!

이제 항목을 등록하면:
- ✅ **자동으로** ggonsajang@gmail.com으로 이메일 발송
- ✅ **수동 작업 불필요** (전송 버튼 누를 필요 없음)
- ✅ **CSV 형식** - 엑셀에 완벽하게 붙여넣기 가능

---

## 🔧 문제 해결

### EmailJS가 설정되지 않았을 때
- 자동으로 **mailto** 방식으로 폴백
- 이메일 앱이 열리고 사용자가 전송 버튼을 눌러야 함

### 이메일이 안 가면
1. 개발자 도구 (F12) → Console 탭 확인
2. EmailJS 오류 메시지 확인
3. `.env.local` 파일 값이 올바른지 확인
4. 서버를 재시작했는지 확인

---

## 💡 무료 한도

EmailJS 무료 플랜:
- **월 200개 이메일** 무료
- 초과 시 유료 플랜 전환 필요

---

## 🚀 Vercel 배포 시

Vercel 프로젝트 설정:
1. **Settings** → **Environment Variables**
2. 다음 3개 변수 추가:
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
