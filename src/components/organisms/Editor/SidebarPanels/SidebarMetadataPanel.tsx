import { IoCloudUpload } from "react-icons/io5";

interface SidebarMetadataPanelProps {
    metadataName: string;
    setMetadataName: (name: string) => void;
    metadataDescription: string;
    setMetadataDescription: (desc: string) => void;
    dispatch: any;
    updateMetadata: any;
    setIsSaveModalOpen: (open: boolean) => void;
}

const SidebarMetadataPanel: React.FC<SidebarMetadataPanelProps> = ({
    metadataName,
    setMetadataName,
    metadataDescription,
    setMetadataDescription,
    dispatch,
    updateMetadata,
    setIsSaveModalOpen,
}) => (
    <div>
        <h4 className='text-md font-bold text-white mb-4'>Ogólne</h4>
        <div className='mb-2'>
            <label className='text-sm text-gray-300 block mb-1'>Nazwa:</label>
            <input
                type='text'
                value={metadataName}
                onChange={(e) => {
                    setMetadataName(e.target.value);
                    dispatch(updateMetadata({ key: "name", value: e.target.value }));
                }}
                className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm'
            />
        </div>
        <div className='mb-4'>
            <label className='text-sm text-gray-300 block mb-1'>Opis:</label>
            <textarea
                value={metadataDescription}
                onChange={(e) => {
                    setMetadataDescription(e.target.value);
                    dispatch(updateMetadata({ key: "description", value: e.target.value }));
                }}
                className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm h-20'
            />
        </div>
        <div className='mt-6 pt-4 border-t border-gray-700'>
            <h5 className='text-sm font-bold text-white mb-2'>
                Zapisz Escape Room
            </h5>
            <button
                onClick={() => setIsSaveModalOpen(true)}
                className='w-full py-3 bg-mainMint text-gray-800 rounded-lg font-semibold hover:bg-opacity-50 transition-colors flex items-center justify-center'>
                <IoCloudUpload className='mr-2' size={16} />
                Zapisz
            </button>
        </div>
    </div>
);

export default SidebarMetadataPanel;