import React from "react"

interface NotifyBlockProps {
  notifyStr?: string;
  isGreen?: boolean;
  children?: React.ReactNode;
}
const NotifyBlock = ({ notifyStr, isGreen = false, children }: NotifyBlockProps) => {
  return (
    <>
      {isGreen ? (
        <div className="px-5 text-green-700 font-bold">{children ? children : notifyStr}</div>
      ) : (
        <div className="px-5 text-red-700 font-bold">{children ? children : notifyStr}</div>
      )}
    </>
  );
};

export default NotifyBlock;