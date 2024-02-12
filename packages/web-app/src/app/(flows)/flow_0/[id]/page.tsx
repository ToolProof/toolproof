
export default function Page({ params: { id }}: { params: { id: string } }) {
    return <div className="flex justify-center items-center h-full w-full overflow-hidden bg-[#544f4f]">{id}</div>;
  }