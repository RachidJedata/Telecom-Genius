import Simulation3D from "@/components/env/urban-propagation";
import { Toaster } from "@/components/UI/toaster";
// import { Suspense } from "react";


export default function Page() {
  return (
    <>
      {/* <Suspense fallback={<div>Loading...</div>}> */}
      <Simulation3D />
      {/* </Suspense> */}
      <Toaster />
    </>
  )
}

