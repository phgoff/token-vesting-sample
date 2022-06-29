import Navbar from "./navbar";

type Props = {
  preview?: boolean;
  children: React.ReactNode;
};

const Layout = ({ preview, children }: Props) => {
  return (
    <>
      <Navbar />
      <div className="h-content container mx-auto p-4">
        <main>{children}</main>
      </div>
    </>
  );
};

export default Layout;
