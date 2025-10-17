import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { UploadCloud, Save, Trash2, Info } from 'lucide-react';

const SponsorManagement: React.FC = () => {
    const { selectedTournament, addSponsor, deleteSponsor } = useData();
    const [name, setName] = useState('');
    const [logo, setLogo] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!selectedTournament) {
        return <p>Selecione um torneio para gerenciar patrocinadores.</p>;
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSponsor = () => {
        if (name && logo && selectedTournament) {
            addSponsor(selectedTournament.id, name, logo);
            setName('');
            setLogo(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else {
            alert('Por favor, preencha o nome e selecione um logo.');
        }
    };

    const handleDeleteSponsor = (sponsorId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este patrocinador?')) {
            deleteSponsor(selectedTournament.id, sponsorId);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Adicionar Novo Patrocinador</h3>
                
                <div className="bg-blue-900/30 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg relative mb-4 text-sm flex items-start gap-3" role="alert">
                    <Info size={20} className="flex-shrink-0 mt-0.5"/>
                    <div>
                        <strong className="font-bold">Dicas para melhor visualização:</strong>
                        <ul className="list-disc list-inside mt-1">
                            <li>Use logos com fundo transparente (formato PNG).</li>
                            <li>Prefira logos com formato horizontal (ex: 3:1).</li>
                            <li>O efeito de rolagem fica ideal com pelo menos 6-8 patrocinadores.</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Patrocinador</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                            placeholder="Ex: Supermercado Campeão"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Logo do Patrocinador</label>
                        <div
                            className="w-full h-32 bg-cover bg-center rounded-md border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-900 relative group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                            style={{ backgroundImage: logo ? `url('${logo}')` : 'none' }}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                <UploadCloud size={24} />
                                <span className="text-sm font-semibold mt-1">Trocar Imagem</span>
                            </div>
                            {!logo && (
                                <div className="text-center text-gray-500">
                                    <UploadCloud size={24} />
                                    <span className="text-sm mt-1">Clique para selecionar</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleAddSponsor}
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Adicionar Patrocinador
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-4">Patrocinadores Atuais</h3>
                {selectedTournament.sponsors && selectedTournament.sponsors.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {selectedTournament.sponsors.map(sponsor => (
                            <div key={sponsor.id} className="relative group">
                                <div className="bg-gray-700 p-2 rounded-lg aspect-video flex items-center justify-center">
                                    <img src={sponsor.logo} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
                                </div>
                                <p className="text-center text-sm mt-1 truncate">{sponsor.name}</p>
                                <button
                                    onClick={() => handleDeleteSponsor(sponsor.id)}
                                    className="absolute top-0 right-0 m-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Excluir patrocinador"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Nenhum patrocinador cadastrado para este torneio.</p>
                )}
            </div>
        </div>
    );
};

export default SponsorManagement;
