import Image from "next/image";

interface IconProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  text?: string;
  handleClick?: () => void;
}

const Icon = ({ src, alt, width, height, text, handleClick }: IconProps) => {
  return (
    <div className="text-center" onClick={handleClick}>
      <Image
        src={src} // public 디렉토리 내의 경로
        alt={alt ? alt : "Icon Image"} // 대체 텍스트
        width={width ? width : 100} // 이미지 폭
        height={height ? height : 100} // 이미지 높이
      />
      <div className=" text-slate-100 text-lg">{text ? text : "Icon"}</div>
    </div>
  );
};

export default Icon;
