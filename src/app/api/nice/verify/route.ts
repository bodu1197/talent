import { NextRequest, NextResponse } from "next/server";

// NICE 본인인증 요청 API
// 실제 환경에서는 NICE 평가정보 API를 연동해야 함
export async function GET(_request: NextRequest) {
  // 실제로는 NICE API에 요청하고 EncodeData를 받아옴
  // 여기서는 테스트용 HTML 페이지 반환

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>NICE 본인인증</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
import toast from "react-hot-toast";
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h2 {
      color: rgb(15, 52, 96);
      margin-bottom: 20px;
      text-align: center;
    }
    .info {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #1976d2;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 12px;
      background: rgb(15, 52, 96);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 10px;
    }
    button:hover {
      background: rgb(26, 75, 125);
    }
    button.cancel {
      background: #e0e0e0;
      color: #666;
    }
    button.cancel:hover {
      background: #d0d0d0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>NICE 휴대폰 본인인증</h2>

    <div class="info">
      ⚠️ 개발 환경: 테스트용 인증 페이지입니다.<br>
      실제 NICE API 연동 시 이 페이지는 NICE 인증 페이지로 리다이렉트됩니다.
    </div>

    <form id="verifyForm">
      <div class="form-group">
        <label>이름</label>
        <input type="text" id="name" placeholder="홍길동" required>
      </div>

      <div class="form-group">
        <label>휴대폰 번호</label>
        <input type="tel" id="phone" placeholder="01012345678" required>
      </div>

      <div class="form-group">
        <label>생년월일</label>
        <input type="text" id="birthDate" placeholder="19900101" required>
      </div>

      <button type="submit">인증 완료</button>
      <button type="button" class="cancel" onclick="window.close()">취소</button>
    </form>
  </div>

  <script>
    document.getElementById('verifyForm').addEventListener('submit', function(e) {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const phone = document.getElementById('phone').value;
      const birthDate = document.getElementById('birthDate').value;

      // 부모 창으로 인증 결과 전송
      if (window.opener) {
        window.opener.postMessage({
          type: 'NICE_VERIFICATION_SUCCESS',
          data: {
            name: name,
            phone: phone,
            birthDate: birthDate,
            gender: 'M'
          }
        }, window.location.origin);

        toast.error('본인인증이 완료되었습니다.');
        window.close();
      }
    });
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
