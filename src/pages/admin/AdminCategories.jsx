import { useEffect, useState } from 'react'
import AdminNav from '../../components/admin/AdminNav'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { colors, fontFamily } from '../../components/ui/tokens'
import { getAdminSession } from '../../lib/session'
import { fetchCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory } from '../../lib/api'

const emptyForm = { name: '', slug: '', description: '' }

export default function AdminCategories() {
  const session = getAdminSession()
  const token = session?.accessToken
  const [categories, setCategories] = useState(undefined)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const load = () => {
    fetchCategories().then((result) => {
      if (result.status === 'success') setCategories(result.data)
    })
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setError('')
    setCreating(true)
  }

  const openEdit = (category) => {
    setForm({ name: category.name, slug: category.slug, description: category.description || '' })
    setError('')
    setEditing(category)
  }

  const closeModals = () => {
    setCreating(false)
    setEditing(null)
  }

  const handleCreate = async () => {
    setPending(true)
    setError('')
    const result = await createAdminCategory(token, { name: form.name.trim(), slug: form.slug.trim(), description: form.description.trim() || undefined })
    setPending(false)
    if (result.status !== 'success') {
      setError(result.message || 'Could not create category.')
      return
    }
    setCategories((current) => [...current, result.data].sort((a, b) => a.name.localeCompare(b.name)))
    closeModals()
  }

  const handleUpdate = async () => {
    setPending(true)
    setError('')
    const result = await updateAdminCategory(token, editing._id, { name: form.name.trim(), description: form.description.trim() || undefined })
    setPending(false)
    if (result.status !== 'success') {
      setError(result.message || 'Could not update category.')
      return
    }
    setCategories((current) => current.map((c) => (c._id === editing._id ? result.data : c)))
    closeModals()
  }

  const handleDelete = async (category) => {
    setPending(true)
    const result = await deleteAdminCategory(token, category._id)
    setPending(false)
    if (result.status === 'success') {
      setCategories((current) => current.filter((c) => c._id !== category._id))
    } else if (result.status === 'server-error') {
      alert(result.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.surface, fontFamily }}>
      <AdminNav />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.text }}>Categories</h1>
          <Button variant="accent" size="sm" onClick={openCreate}>+ New Category</Button>
        </div>

        {categories === undefined && <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Loading…</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categories?.map((c) => (
            <Card key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: colors.text, margin: 0 }}>{c.name}</p>
                <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0' }}>/{c.slug}{c.description ? ` · ${c.description}` : ''}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(c)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal open={creating} onClose={closeModals} title="New Category">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))} placeholder="e.g. home-decor" />
          <Textarea label="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
          {error && <p style={{ fontSize: '13px', color: colors.danger, margin: 0 }}>{error}</p>}
          <Button variant="accent" loading={pending} onClick={handleCreate}>Create</Button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={closeModals} title="Edit Category">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Textarea label="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
          {error && <p style={{ fontSize: '13px', color: colors.danger, margin: 0 }}>{error}</p>}
          <Button variant="accent" loading={pending} onClick={handleUpdate}>Save</Button>
        </div>
      </Modal>
    </div>
  )
}
