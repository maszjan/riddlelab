import { MdOutlineTexture } from "react-icons/md";

interface SidebarFloorPanelProps {
    isBorderClosedState: boolean;
    isGridFilledState: boolean;
    currentRoom: any;
    wallColor: string;
    wallThickness: number;
    selectedAssetDetails: any;
    selectedTexture: string | null;
    handleAcceptFloor: () => void;
    handleWallColorChange: (color: string) => void;
    handleClearWallColor: () => void;
    handleWallThicknessChange: (thickness: number) => void;
    handleApplyChanges: () => void;
    setCurrentAssetType: (type: string) => void;
    setIsAssetModalOpen: (open: boolean) => void;
}

const SidebarFloorPanel: React.FC<SidebarFloorPanelProps> = ({
    isBorderClosedState,
    isGridFilledState,
    currentRoom,
    wallColor,
    wallThickness,
    selectedAssetDetails,
    selectedTexture,
    handleAcceptFloor,
    handleWallColorChange,
    handleClearWallColor,
    handleWallThicknessChange,
    handleApplyChanges,
    setCurrentAssetType,
    setIsAssetModalOpen,
}) => {
    if (!currentRoom.floorAccepted) {
        return (
            <div>
                <h4 className='text-md font-bold text-white mb-2'>Podłoga</h4>
                <p className='text-sm text-gray-300'>
                    Kliknij na siatkę, aby rysować podłogę.
                </p>
                {!isBorderClosedState && (
                    <p className='text-sm text-yellow-500 mt-2'>
                        Musisz narysować zamkniętą granicę, aby wypełnić podłogę.
                    </p>
                )}
                {isBorderClosedState && !isGridFilledState && (
                    <p className='text-sm text-red-500 mt-2'>
                        Wszystkie pola wewnątrz granicy muszą być wypełnione.
                    </p>
                )}
                {isGridFilledState && (
                    <button
                        onClick={handleAcceptFloor}
                        className='w-24 bg-mainMint text-gray-700 py-2 rounded mt-4'>
                        Zatwierdź
                    </button>
                )}
            </div>
        );
    }
    return (
        <div className='flex flex-col space-y-4 mr-5'>
            <div className='flex flex-col space-y-4'>
                <h4 className='text-md font-bold text-white mb-4'>
                    Tekstura podłogi
                </h4>
                <p className='text-sm text-gray-300 mb-2'>
                    Wybierz teksturę dla podłogi
                </p>
                <div className='flex flex-col space-y-2'>
                    <div className='flex items-center justify-between'>
                        <label className='text-lg mt-1 text-gray-300'>
                            Tekstura:
                        </label>
                        <div className='relative'>
                            <button
                                onClick={() => {
                                    setCurrentAssetType("floor");
                                    setIsAssetModalOpen(true);
                                }}
                                className='flex items-center justify-center w-12 h-12 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600'>
                                <MdOutlineTexture className='h-6 w-6' />
                            </button>
                        </div>
                    </div>
                    {(selectedAssetDetails?.url || selectedTexture) && (
                        <div className='mt-2 relative'>
                            <div className='relative w-24 h-24 border border-gray-600 rounded overflow-hidden'>
                                <div
                                    className='absolute inset-0'
                                    style={{
                                        backgroundImage: `url(${
                                            selectedAssetDetails?.url || selectedTexture
                                        })`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <h4 className='text-md font-bold text-white mb-4'>
                Dostosowanie ścian
            </h4>
            <p className='text-sm text-gray-300 mb-2'>
                Wybierz kolor i grubość
            </p>
            <div className='flex flex-col space-y-4'>
                <div className='flex items-center justify-between'>
                    <label className='text-lg text-gray-300'>Kolor:</label>
                    <input
                        type='color'
                        value={wallColor}
                        onChange={(e) => handleWallColorChange(e.target.value)}
                        className='w-12 h-6 border-none rounded'
                    />
                </div>
                {wallColor && (
                    <div>
                        <div className='relative w-24 h-24 border border-gray-600 rounded overflow-hidden mt-2'>
                            <div
                                className='absolute inset-0'
                                style={{
                                    backgroundColor: wallColor,
                                }}></div>
                            <button
                                onClick={handleClearWallColor}
                                className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600'
                                title='Usuń kolor'>
                                X
                            </button>
                        </div>
                    </div>
                )}
                <div className='flex items-center justify-between'>
                    <label className='text-lg text-gray-300'>Grubość:</label>
                    <input
                        type='range'
                        min={1}
                        max={20}
                        value={wallThickness}
                        onChange={(e) =>
                            handleWallThicknessChange(parseInt(e.target.value, 10))
                        }
                        className='w-full ml-4 accent-mainMint'
                    />
                </div>
                <button
                    onClick={handleApplyChanges}
                    className='w-24 bg-mainMint font-semibold text-gray-700 py-2 rounded mt-4'>
                    Użyj
                </button>
            </div>
        </div>
    );
};

export default SidebarFloorPanel;