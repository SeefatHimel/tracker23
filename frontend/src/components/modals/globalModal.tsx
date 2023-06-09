import { Modal } from "antd";
import { useRouter } from "next/router";
type Props = {
  children: any;
  isModalOpen: boolean;
  setIsModalOpen: Function;
  handleCancel?: Function;
  title?: string;
  className?: string;
};
const GlobalMOdal = ({
  children,
  isModalOpen,
  setIsModalOpen,
  title,
  className,
  handleCancel,
}: Props) => {
  const router = useRouter();
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleOnCancel = () => {
    if (handleCancel) handleCancel();
    setIsModalOpen(false);
  };
  return (
    <Modal
      title={title}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleOnCancel}
      width={"720px"}
      className={className}
      footer={null}
    >
      {children}
    </Modal>
  );
};

export default GlobalMOdal;
