import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Save, UploadCloud, Palette } from 'lucide-react';

const Configuration: React.FC = () => {
  const { selectedTournament, updateTournamentBranding, updateTournamentColors } = useData();
  const [bgUrl, setBgUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#FFFFFF');
  const [secondaryColor, setSecondaryColor] = useState('#FFD700');

  const bgInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedTournament) {
      setBgUrl(selectedTournament.backgroundImage || '');
      setLogoUrl(selectedTournament.logoImage || '');
      setPrimaryColor(selectedTournament.colors?.primary || '#FFFFFF');
      setSecondaryColor(selectedTournament.colors?.secondary || '#FFD700');
    }
  }, [selectedTournament]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'bg' | 'logo') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        if (type === 'bg') {
          setBgUrl(base64data);
        } else {
          setLogoUrl(base64data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (selectedTournament) {
      updateTournamentBranding(selectedTournament.id, { bg: bgUrl, logo: logoUrl });
      updateTournamentColors(selectedTournament.id, { primary: primaryColor, secondary: secondaryColor });
      alert('Configurações salvas!');
    }
  };
  
  if (!selectedTournament) {
    return <p>Selecione um torneio para configurar.</p>;
  }

  const UploadArea: React.FC<{
    label: string;
    imageUrl: string;
    inputRef: React.RefObject<HTMLInputElement>;
    onButtonClick: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }> = ({ label, imageUrl, inputRef, onButtonClick, onFileChange }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div 
        className="w-full h-32 bg-cover bg-center rounded-md border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-900 relative group cursor-pointer" 
        style={{ backgroundImage: imageUrl ? `url('${imageUrl}')` : 'none' }}
        onClick={onButtonClick}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={onFileChange}
          accept="image/*"
          className="hidden"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
          <UploadCloud size={24} />
          <span className="text-sm font-semibold mt-1">Trocar Imagem</span>
        </div>
        {!imageUrl && (
          <div className="text-center text-gray-500">
            <UploadCloud size={24} />
            <span className="text-sm mt-1">Nenhuma imagem</span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onButtonClick}
        className="w-full text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md transition-colors"
      >
        Escolher Arquivo
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
       <fieldset>
        <legend className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2"><Palette size={20}/> Cores do Texto</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center gap-4">
                <label htmlFor="primaryColor" className="text-sm font-medium text-gray-300">Cor Primária (Nomes, Títulos)</label>
                <input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                />
            </div>
            <div className="flex items-center gap-4">
                <label htmlFor="secondaryColor" className="text-sm font-medium text-gray-300">Cor Secundária (Detalhes, Destaques)</label>
                <input
                    type="color"
                    id="secondaryColor"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="w-12 h-12 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                />
            </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-semibold text-gray-200 mb-4">Identidade Visual</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UploadArea
            label="Imagem de Fundo"
            imageUrl={bgUrl}
            inputRef={bgInputRef}
            onButtonClick={() => bgInputRef.current?.click()}
            onFileChange={(e) => handleFileChange(e, 'bg')}
          />
          <UploadArea
            label="Logo da Arena"
            imageUrl={logoUrl}
            inputRef={logoInputRef}
            onButtonClick={() => logoInputRef.current?.click()}
            onFileChange={(e) => handleFileChange(e, 'logo')}
          />
        </div>
      </fieldset>

      <div className="pt-6 border-t border-gray-700">
        <button
          onClick={handleSave}
          className="bg-brand-yellow text-gray-900 font-bold py-2 px-6 rounded-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
        >
          <Save size={18} /> Salvar Configurações
        </button>
      </div>
    </div>
  );
};

export default Configuration;
