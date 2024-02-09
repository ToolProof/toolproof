
export default function Page({ params: { idPath }}: { params: { idPath: string } }) {
    return <div className="flex justify-center items-center h-full w-full overflow-hidden bg-[#544f4f]">{idPath}</div>;
  }