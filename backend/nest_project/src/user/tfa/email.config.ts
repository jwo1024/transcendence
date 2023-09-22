export default {
    transport: {
      host: 'smtp.gmail.com',
      port: 587, // SMTP 포트 번호 (일반적으로 587 또는 465 사용)
      secure: true, // true이면 SSL을 사용
      auth: {
        user: 'j7254913@gmail.com',
        pass: 'tnejdimmcqnfdwbt',
      }
    }
};
// 여기도 전부 configService에서 가져다 쓰는 형태로 리팩토링 해야한다.