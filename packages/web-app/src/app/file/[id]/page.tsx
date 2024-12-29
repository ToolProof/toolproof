import { fooAction } from '@/lib/fooAction';
import ReactMarkdown from 'react-markdown';

type Props = {
    params: {
        id: string;
    }
}

export default async function File({ params: { id } }: Props) {
    const idCorrected = id.replaceAll('%3A', ':');
    const content = await fooAction(idCorrected);

    return (
        <div className="m-4">
            <h1 className="mb-4">File {id}</h1>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );

}