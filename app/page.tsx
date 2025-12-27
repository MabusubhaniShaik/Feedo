// // app/page.tsx
// import { redirect } from "next/navigation";

// const Page = () => {
//   redirect("/dashboard");
// };

// export default Page;

// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");

    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/signin");
    }
  }, [router]);

  return null; // no UI flicker
};

export default Page;
