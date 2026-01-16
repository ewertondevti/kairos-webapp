"use client";

import { CustomHeader } from "../CustomHeader";

type AppLayoutProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const AppLayout = ({ children, footer }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomHeader />
      <main className="flex-1">{children}</main>
      {footer}
    </div>
  );
};

export default AppLayout;
