"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  AUTH_REQUIRED,
  type FooterContactAdmin,
} from "@/api/footer";

export type ContactsSectionProps = {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onClearMessages: () => void;
};

const inputClass =
  "px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]";
const inputSmClass =
  "px-2 py-1.5 rounded bg-[#2a2e33] border border-[#53565B] text-gray-100 text-sm";
const buttonPrimaryClass =
  "px-4 py-2 rounded-lg bg-[#ff7d24] text-white font-medium hover:bg-[#e66f1a] disabled:opacity-50 disabled:cursor-not-allowed";

export function ContactsSection({
  onError,
  onSuccess,
  onClearMessages,
}: ContactsSectionProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<FooterContactAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [cityCountry, setCityCountry] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCityCountry, setEditCityCountry] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listContacts();
      setContacts(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки контактов";
      if (msg === AUTH_REQUIRED) {
        router.replace("/login");
        return;
      }
      onError(msg);
    } finally {
      setLoading(false);
    }
  }, [router, onError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClearMessages();
    const city_country = cityCountry.trim();
    if (!city_country) {
      onError("Введите город и страну");
      return;
    }
    setSubmitLoading(true);
    try {
      await createContact({
        city_country,
        address: address.trim() || null,
        contact: contact.trim() || null,
        sort_order: sortOrder,
      });
      onSuccess("Контакт добавлен");
      setCityCountry("");
      setAddress("");
      setContact("");
      setSortOrder(
        contacts.length > 0 ? Math.max(...contacts.map((c) => c.sort_order), 0) + 1 : 0
      );
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка добавления контакта");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    onClearMessages();
    setDeletingId(id);
    try {
      await deleteContact(id);
      onSuccess("Контакт удалён");
      await load();
      if (editingId === id) setEditingId(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (c: FooterContactAdmin) => {
    setEditingId(c.id);
    setEditCityCountry(c.city_country);
    setEditAddress(c.address ?? "");
    setEditContact(c.contact ?? "");
    setEditSortOrder(c.sort_order);
  };

  const handleSaveEdit = async (id: number) => {
    onClearMessages();
    const city_country = editCityCountry.trim();
    if (!city_country) {
      onError("Город и страна обязательны");
      return;
    }
    try {
      await updateContact(id, {
        city_country,
        address: editAddress.trim() || null,
        contact: editContact.trim() || null,
        sort_order: editSortOrder,
      });
      onSuccess("Контакт обновлён");
      setEditingId(null);
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка обновления контакта");
    }
  };

  return (
    <section className="rounded-xl bg-[#3f444b] p-6 text-gray-300 mb-6">
      <h2 className="text-lg font-medium text-gray-100 mb-4">Контакты</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Город и страна</label>
          <input
            type="text"
            value={cityCountry}
            onChange={(e) => setCityCountry(e.target.value)}
            placeholder="Москва, Россия"
            className={`w-48 ${inputClass}`}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Адрес</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="ул. Примерная, 1"
            className={`w-56 ${inputClass}`}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Контакт</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="+7 (495) 123-45-67"
            className={`w-48 ${inputClass}`}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Порядок</label>
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            className={`w-20 ${inputClass}`}
          />
        </div>
        <button
          type="submit"
          disabled={submitLoading}
          className={buttonPrimaryClass}
        >
          {submitLoading ? "Добавление…" : "Добавить контакт"}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Загрузка списка...</p>
      ) : contacts.length === 0 ? (
        <p className="text-gray-500">Контактов пока нет.</p>
      ) : (
        <ul className="space-y-3">
          {contacts.map((c) => (
            <li
              key={c.id}
              className="py-3 border-b border-[#53565B] last:border-0"
            >
              {editingId === c.id ? (
                <div className="flex flex-wrap items-end gap-3">
                  <input
                    type="text"
                    value={editCityCountry}
                    onChange={(e) => setEditCityCountry(e.target.value)}
                    placeholder="Город и страна"
                    className={`w-44 ${inputSmClass}`}
                  />
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Адрес"
                    className={`w-44 ${inputSmClass}`}
                  />
                  <input
                    type="text"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    placeholder="Контакт"
                    className={`w-40 ${inputSmClass}`}
                  />
                  <input
                    type="number"
                    min={0}
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(Number(e.target.value) || 0)}
                    className={`w-16 ${inputSmClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(c.id)}
                    className="text-sm text-[#ff7d24] hover:underline"
                  >
                    Сохранить
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-100">{c.city_country}</p>
                    {c.address && <p className="text-sm text-gray-500">{c.address}</p>}
                    {c.contact && <p className="text-sm text-gray-500">{c.contact}</p>}
                  </div>
                  <span className="text-sm text-gray-500">Порядок: {c.sort_order}</span>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(c)}
                    className="text-sm text-[#ff7d24] hover:underline"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="ml-auto px-3 py-1 rounded text-sm bg-red-900/50 text-red-200 hover:bg-red-900/70 disabled:opacity-50"
                  >
                    {deletingId === c.id ? "Удаление…" : "Удалить"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
