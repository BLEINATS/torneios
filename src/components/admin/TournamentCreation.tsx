import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { Tournament, TournamentModality, TournamentStatus, TournamentCategory } from '../../types';
import { Plus, Trash2, Trophy, X, Pencil } from 'lucide-react';
import { faker } from '@faker-js/faker';
import CustomCombobox from '../ui/CustomCombobox';

const defaultLevels = ['Iniciante', 'Intermediário', 'Avançado', 'Amador', 'Profissional', 'Aberto'];

const TournamentCreation: React.FC = () => {
    const { tournaments, addTournament, updateTournament, selectTournament, secondaryTextColor } = useData();
    
    const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

    const [name, setName] = useState('');
    const [tournamentType, setTournamentType] = useState('Torneio');
    const [status, setStatus] = useState<TournamentStatus>('planejado');
    const [modality, setModality] = useState<TournamentModality>('duplas');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('18:00');
    const [courts, setCourts] = useState<string[]>(['Quadra 1']);
    const [newCourt, setNewCourt] = useState('');
    const [categories, setCategories] = useState<Partial<TournamentCategory>[]>([
        { group: 'aberto', level: 'Aberto', maxEntries: 16, entryFee: 0, prize1: '', prize2: '', prize3: '' }
    ]);

    const resetForm = () => {
        setName('');
        setTournamentType('Torneio');
        setStatus('planejado');
        setModality('duplas');
        setStartDate('');
        setEndDate('');
        setStartTime('09:00');
        setEndTime('18:00');
        setCourts(['Quadra 1']);
        setCategories([{ group: 'aberto', level: 'Aberto', maxEntries: 16, entryFee: 0, prize1: '', prize2: '', prize3: '' }]);
    };

    useEffect(() => {
        if (editingTournament) {
            setName(editingTournament.name);
            setTournamentType(editingTournament.tournamentType);
            setStatus(editingTournament.status);
            setModality(editingTournament.modality);
            setStartDate(editingTournament.startDate);
            setEndDate(editingTournament.endDate);
            setStartTime(editingTournament.startTime);
            setEndTime(editingTournament.endTime);
            setCourts(editingTournament.courts);
            setCategories(editingTournament.categories);
        } else {
            resetForm();
        }
    }, [editingTournament]);

    const handleAddCourt = () => {
        if (newCourt.trim() && !courts.includes(newCourt.trim())) {
            setCourts([...courts, newCourt.trim()]);
            setNewCourt('');
        }
    };

    const handleRemoveCourt = (courtToRemove: string) => {
        setCourts(courts.filter(court => court !== courtToRemove));
    };

    const handleAddCategory = () => {
        setCategories([...categories, { group: 'aberto', level: 'Aberto', maxEntries: 16, entryFee: 0, prize1: '', prize2: '', prize3: '' }]);
    };

    const handleRemoveCategory = (index: number) => {
        if (categories.length > 1) {
            setCategories(categories.filter((_, i) => i !== index));
        }
    };

    const handleCategoryChange = (index: number, field: keyof TournamentCategory, value: any) => {
        const newCategories = [...categories];
        const categoryToUpdate = { ...newCategories[index] };
        (categoryToUpdate as any)[field] = value;
        newCategories[index] = categoryToUpdate;
        setCategories(newCategories);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && startDate && endDate) {
            if (editingTournament) {
                const categoriesForUpdate: Partial<TournamentCategory>[] = categories.map(cat => ({
                    ...cat,
                    maxEntries: Number(cat.maxEntries) || 0,
                    entryFee: Number(cat.entryFee) || 0,
                }));
    
                updateTournament(
                    editingTournament.id,
                    {
                        name, tournamentType, status, modality,
                        startDate, endDate, startTime, endTime, courts,
                    },
                    categoriesForUpdate
                );
                setEditingTournament(null);
            } else {
                const finalCategories: TournamentCategory[] = categories.map(cat => ({
                    id: faker.string.uuid(),
                    group: cat.group || 'aberto',
                    level: cat.level || 'Aberto',
                    maxEntries: Number(cat.maxEntries) || 0,
                    entryFee: Number(cat.entryFee) || 0,
                    prize1: cat.prize1,
                    prize2: cat.prize2,
                    prize3: cat.prize3,
                }));

                addTournament({
                    name, tournamentType, status, modality,
                    startDate, endDate, startTime, endTime, courts,
                    categories: finalCategories
                });
            }
            resetForm();
        }
    };

    return (
        <div className="p-6 pt-28 h-full container mx-auto text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-4xl font-black text-shadow-md mb-8" style={{ color: secondaryTextColor }}>Gerenciar Torneios</h2>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 bg-black bg-opacity-50 rounded-lg p-6">
                        <h3 className="text-2xl font-bold mb-6">{editingTournament ? `Editando: ${editingTournament.name}` : 'Criar Novo Torneio'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <legend className="text-lg font-semibold mb-2 col-span-full" style={{ color: secondaryTextColor }}>Informações Gerais</legend>
                                <div className="md:col-span-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome do Torneio</label>
                                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" required />
                                </div>
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TournamentStatus)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                                        <option value="planejado">Planejado</option>
                                        <option value="em-andamento">Em Andamento</option>
                                        <option value="finalizado">Finalizado</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="modality" className="block text-sm font-medium text-gray-300 mb-1">Modalidade</label>
                                    <select id="modality" value={modality} onChange={(e) => setModality(e.target.value as TournamentModality)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                                        <option value="individual">Individual</option>
                                        <option value="duplas">Duplas</option>
                                        <option value="equipe">Equipes</option>
                                    </select>
                                </div>
                            </fieldset>

                            <div>
                                <fieldset>
                                    <legend className="text-lg font-semibold mb-2 col-span-full" style={{ color: secondaryTextColor }}>Categorias e Premiações</legend>
                                    <div className="space-y-4">
                                        {categories.map((category, index) => (
                                            <div key={index} className="bg-gray-800 p-4 rounded-lg space-y-4 relative">
                                                {categories.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveCategory(index)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"><Trash2 size={14} /></button>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Grupo</label>
                                                        <select value={category.group} onChange={(e) => handleCategoryChange(index, 'group', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                                                            <option value="aberto">Aberto</option><option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="misto">Misto</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Nível</label>
                                                        <CustomCombobox
                                                            value={category.level || ''}
                                                            onChange={(newValue) => handleCategoryChange(index, 'level', newValue)}
                                                            options={defaultLevels}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <input type="text" placeholder="1º Lugar (Opcional)" value={category.prize1 || ''} onChange={e => handleCategoryChange(index, 'prize1', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                                                    <input type="text" placeholder="2º Lugar (Opcional)" value={category.prize2 || ''} onChange={e => handleCategoryChange(index, 'prize2', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                                                    <input type="text" placeholder="3º Lugar (Opcional)" value={category.prize3 || ''} onChange={e => handleCategoryChange(index, 'prize3', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Máx. de Inscritos</label>
                                                        <input type="number" min="2" value={category.maxEntries || ''} onChange={e => handleCategoryChange(index, 'maxEntries', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Taxa de Inscrição (R$)</label>
                                                        <input type="number" min="0" value={category.entryFee || ''} onChange={e => handleCategoryChange(index, 'entryFee', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={handleAddCategory} className="mt-4 w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-500 transition-colors flex items-center justify-center gap-2">
                                        <Plus size={20} /> Adicionar Categoria
                                    </button>
                                </fieldset>
                            </div>

                             <fieldset className="grid grid-cols-1 gap-4">
                                <legend className="text-lg font-semibold mb-2 col-span-full" style={{ color: secondaryTextColor }}>Quadras</legend>
                                <div className="flex gap-2">
                                    <input type="text" value={newCourt} onChange={e => setNewCourt(e.target.value)} placeholder="Nome da nova quadra" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                                    <button type="button" onClick={handleAddCourt} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 transition-colors"><Plus size={20} /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {courts.map(court => (
                                        <div key={court} className="bg-gray-700 rounded-full px-3 py-1 flex items-center gap-2">
                                            <span>{court}</span>
                                            <button type="button" onClick={() => handleRemoveCourt(court)} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                            
                            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <legend className="text-lg font-semibold mb-2 col-span-full" style={{ color: secondaryTextColor }}>Datas</legend>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Data de Início</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Data de Fim</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" required />
                                </div>
                            </fieldset>

                            <div className="flex gap-4">
                                <button type="submit" className="flex-grow bg-brand-yellow text-gray-900 font-bold py-3 px-4 rounded-md hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 text-lg">
                                    <Plus size={22} /> {editingTournament ? 'Salvar Alterações' : 'Criar Torneio'}
                                </button>
                                {editingTournament && (
                                    <button type="button" onClick={() => setEditingTournament(null)} className="bg-gray-600 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-500 transition-colors">
                                        Cancelar Edição
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-2 bg-black bg-opacity-50 rounded-lg p-6">
                        <h3 className="text-2xl font-bold mb-4">Selecionar Torneio para Gerenciar</h3>
                        <div className="max-h-[80vh] overflow-y-auto pr-2 space-y-3">
                            {tournaments.map(t => (
                                <div key={t.id} className="w-full text-left bg-gray-800 p-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-between gap-4">
                                    <button onClick={() => selectTournament(t.id)} className="flex items-center gap-4 flex-grow">
                                        <Trophy style={{ color: t.colors?.secondary || secondaryTextColor }} className="flex-shrink-0" />
                                        <div>
                                            <p className="font-bold">{t.name}</p>
                                            <p className="text-sm text-gray-400 capitalize">{t.modality}</p>
                                            <p className="text-sm text-gray-400">{t.teams.length} participantes</p>
                                        </div>
                                    </button>
                                    <button onClick={() => setEditingTournament(t)} className="p-2 text-gray-400 hover:text-white" title="Editar Torneio">
                                        <Pencil size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TournamentCreation;
