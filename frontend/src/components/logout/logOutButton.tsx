import { useDispatch } from "react-redux";
import { userAPI } from "../../../APIs/index";
import LogoutIconSvg from "@/assets/svg/LogoutIconSvg";
import { resetProjectsSlice } from "@/storage/redux/projectsSlice";
import { resetIntegrationsSlice } from "@/storage/redux/integrationsSlice";
import { setSocket } from "@/storage/redux/notificationsSlice";

const LogOutButton = () => {
  const dispatch = useDispatch();
  const handleLogOut = async () => {
    dispatch(resetIntegrationsSlice());
    dispatch(resetProjectsSlice());
    dispatch(setSocket(null));
    console.log("logging out");
    userAPI.logout();
  };
  return (
    <button
      className="flex w-full items-center gap-1"
      onClick={() => handleLogOut()}
    >
      <LogoutIconSvg />
      <span className="text-[15px] font-semibold">Log out</span>
    </button>
  );
};

export default LogOutButton;
