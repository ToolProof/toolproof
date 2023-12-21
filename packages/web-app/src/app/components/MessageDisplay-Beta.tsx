import { Message } from "shared/typings";

type Props = {
  message: Message;
  isNew: boolean;
};

function MessageDisplay({ message }: Props) {
  const user = message.userId || "";
  const imageSource = (user == "René") ? "/images/rene_stavnes.jpg"
   :  (
      (user == "ChatGPT") ? "/images/openai_logo.png"
        : "/images/peter_park.jpg"
      )

  return <div className={`py-5 text-black ${user == "ChatGPT" && "bg-[#fee054]"}`}>
      <div className={`flex space-x-5 px-10 max-w-2xl mx-auto ${user == "foo" && "text-right"}`}>
        <img src={imageSource} alt="" className="h-8 w-8"/>
        <p className="pt-1 text-sm">
          {message.content}
        </p>
      </div>
    </div>;
}

export default MessageDisplay;