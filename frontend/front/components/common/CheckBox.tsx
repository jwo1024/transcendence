import { SetStateAction, ChangeEvent, Dispatch } from "react";

interface CheckBoxProps {
  label?: string;
  checked: boolean;
  setChecked?: Dispatch<SetStateAction<boolean>>;
  onChange?: () => void;
}

const CheckBox = ({
  label = "checkbox",
  checked,
  setChecked,
  onChange,
}: CheckBoxProps) => {
  const onChageCheckBox = (e: ChangeEvent<HTMLInputElement>) => {
    onChange && onChange();
    setChecked && setChecked(e.target.checked);
  };

  return (
    <span>
      <br />
      <input
        type="checkbox"
        checked={checked}
        onChange={onChageCheckBox}
        className=" text-right"
      />
      <label className=" text-right">
        {` `}
        {label}
      </label>
    </span>
  );
};

export default CheckBox;
