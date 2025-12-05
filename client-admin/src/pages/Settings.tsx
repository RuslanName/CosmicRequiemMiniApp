import { useState, useEffect } from 'react';
import { settingsApi, type Setting, type UpdateSettingDto } from '../api/settings.api';
import { SettingKey, SettingKeyLabels } from '../enums';
import Modal from '../components/Modal';
import '../components/Table.css';

const Settings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [formData, setFormData] = useState<UpdateSettingDto>({});
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (!searchQuery) {
      loadSettings();
    }
  }, [page]);

  const loadSettings = async (searchQueryValue?: string) => {
    try {
      setLoading(true);
      const response = await settingsApi.getAll({ page, limit, query: searchQueryValue || undefined });
      setSettings(response?.data || []);
      setTotal(response?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки настроек');
      setSettings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadSettings(searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value) {
      loadSettings();
    }
  };

  const handleEdit = (setting: Setting) => {
    setEditingSetting(setting);
    setFormData({
      key: setting.key,
      value: setting.value,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingSetting) return;

    try {
      setError('');
      await settingsApi.update(editingSetting.id, formData);
      setIsModalOpen(false);
      setEditingSetting(null);
      loadSettings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка обновления настройки');
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingSetting(null);
    setFormData({});
    setError('');
  };

  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <h2 className="table-title">Настройки</h2>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Поиск по ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            Найти
          </button>
          {searchQuery && (
            <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); loadSettings(); }}>
              Сбросить
            </button>
          )}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ключ</th>
            <th>Значение</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {settings.map((setting) => (
            <tr key={setting.id}>
              <td>{setting.id}</td>
              <td>{SettingKeyLabels[setting.key as SettingKey] || setting.key}</td>
              <td>{setting.value}</td>
              <td>
                <div className="actions">
                  <button className="btn btn-primary" onClick={() => handleEdit(setting)}>
                    Редактировать
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <div className="pagination-info">
          Показано {settings.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} из {total}
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Назад
          </button>
          <span>
            Страница {page} из {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Вперед
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleClose} title="Редактировать настройку">
        <div>
          <div className="form-group">
            <label className="form-label">Ключ</label>
            <select
              className="form-select"
              value={formData.key || ''}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            >
              <option value="">Выберите ключ</option>
              {Object.values(SettingKey).map((key) => (
                <option key={key} value={key}>
                  {SettingKeyLabels[key]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Значение</label>
            <textarea
              className="form-textarea"
              value={formData.value || ''}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={handleClose}>
              Отмена
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Сохранить
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;

