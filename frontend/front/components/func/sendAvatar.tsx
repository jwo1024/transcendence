interface sendAvatarProps {
  setAvatarURL: React.Dispatch<React.SetStateAction<string | null>>;
  uploadAvatar: File | null;
}

const sendAvatar = ({ setAvatarURL, uploadAvatar }: sendAvatarProps) => {
  const formData = new FormData();
  formData.append("image", uploadAvatar as Blob); // 필드 이름을 'image'로 변경
  const token = sessionStorage.getItem("accessToken");
  fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
    .then((res) => {
      if (res.ok) {
        // console.log("이미지 업로드 성공");
        setAvatarURL(URL.createObjectURL(uploadAvatar as Blob)); // as 써도 괜찮을까?
      } else setAvatarURL(""); // console.error("이미지 업로드 실패");
    })
    .catch((err) => {
      setAvatarURL("");
      console.error(err);
    });
};

export default sendAvatar;
