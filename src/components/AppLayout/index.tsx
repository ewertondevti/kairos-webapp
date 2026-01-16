"use client";

import { CustomHeader } from "../CustomHeader";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default AppLayout;
