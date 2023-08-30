import { ChangeEvent, useCallback, useState } from "react";
import { useRef } from "react";

const useMessageForm = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sentMessage, setSentMessage] = useState<string>("");

  const resetInputMessage = () => {
    inputRef.current!.value = "";
  };

  const handleSendMessage = () => {
    // fetch socket io .. something something
    console.log(
      "useForm.tsx : Have to Send message to Server : " + 
      inputRef.current?.value as string
    );
    setSentMessage(inputRef.current?.value as string);
    resetInputMessage();
  };

  const handleFormSubmit = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage();
  }; // useCallback ?

  return {
    inputRef,
    sentMessage,
    handleSendMessage,
    handleFormSubmit,
  };
}

export default useMessageForm;
