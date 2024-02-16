
export default function Page({ params: { id }}: { params: { id: string } }) {
    return <div className="flex-1 flex justify-center items-center m-4 overflow-hidden bg-[#544f4f]">{id}</div>;
  }