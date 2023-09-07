/*-------------------------------------------------------------------------------//
	Use this hook to open and close the menu box 
	Have to use with component <MenuBar>

	1. make menu items to "MenuItemInfo[]" like below
		const menuItemsSets: MenuItemInfo[] = [
	    	{ name: "Settings" },
	    	{ name: "User-List", addFunc: () => console.log("User-List") },
	  	];
		- if you want to add function to menu item, insert function to "addfunc"

	2. and then, use this hook like below
	  const  { menuItemsWithHandlers, showMenuBox } = useMenuBox(menuItems);

	3. set "menuItemsWithHandlers" to <MenuBar menu={menuItemsWithHandlers} />

	4. set "showMenuBox" to where you want to show the menu box like below
		<>
			{showMenuBox[0] ? <SettingMenuBox /> : null}
	    {showMenuBox[1] ? <UserListMenuBox /> : null}
		</> 
*/ //---------------------------------------------------------------------------//

import { useState, useEffect } from "react";
import type { ListProps } from "@/components/common/MenuBar";

interface MenuItemInfo {
  name: string;
  addFunc?: () => void;
}

const useShowMenuBox = (menuItems: MenuItemInfo[]) => {
  const [showMenuBox, setShowMenuBox] = useState<boolean[]>([false]);

  const generateHandleClick =
    ({ index, addFunc }: { index: number; addFunc?: () => void }) =>
    () => {
      setShowMenuBox((prevShowMenuBox) =>
        prevShowMenuBox.map((value, i) => (i === index ? !value : false))
      );
      addFunc?.();
    };

  const menuItemsWithHandlers: ListProps[] = menuItems.map((item, index) => ({
    ...item,
    handleClick: generateHandleClick({ index, addFunc: item.addFunc }),
  }));

  useEffect(() => {
    setShowMenuBox(Array(menuItems.length).fill(false));
    console.log("UseEFFECT useShowMenuBox: ", showMenuBox);
  }, []);

  return { menuItemsWithHandlers, showMenuBox };
};

export default useShowMenuBox;
export type { MenuItemInfo };
