import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bioguard'
const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

let gridfsBucket

const client = new MongoClient(MONGO_URI)
await client.connect()
const nativeDb = client.db()
gridfsBucket = new GridFSBucket(nativeDb)

await mongoose.connect(MONGO_URI)

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  name: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
})

const personSchema = new mongoose.Schema({
  name: String,
  listType: { type: String, enum: ['whitelist', 'blacklist'], required: true },
  photoFileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const accessLogSchema = new mongoose.Schema({
  personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  action: { type: String, enum: ['access_granted', 'access_denied'] },
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

const User = mongoose.model('User', userSchema)
const Person = mongoose.model('Person', personSchema)
const AccessLog = mongoose.model('AccessLog', accessLogSchema)

async function seedAdmin() {
  const existingAdmin = await User.findOne({ role: 'admin' })
  if (existingAdmin) return
  const email = process.env.ADMIN_EMAIL || 'admin@bioguard.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.ADMIN_NAME || 'Administrador Principal'
  const passwordHash = await bcrypt.hash(password, 10)
  await User.create({ email, passwordHash, name, role: 'admin' })
}
await seedAdmin()

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
  next()
}

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
  const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

app.get('/auth/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).lean()
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ id: user._id.toString(), email: user.email, name: user.name, role: user.role, createdAt: user.createdAt })
})

app.get('/users', authMiddleware, adminOnly, async (req, res) => {
  const users = await User.find().lean()
  res.json(users.map(u => ({ id: u._id.toString(), email: u.email, name: u.name, role: u.role, createdAt: u.createdAt })))
})

app.post('/users', authMiddleware, adminOnly, async (req, res) => {
  const { email, password, name, role } = req.body
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, passwordHash, name, role: role === 'admin' ? 'admin' : 'user' })
  res.status(201).json({ id: user._id.toString(), email: user.email, name: user.name, role: user.role, createdAt: user.createdAt })
})

app.patch('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, role, password } = req.body
  const update = {}
  if (name) update.name = name
  if (role) update.role = role === 'admin' ? 'admin' : 'user'
  if (password) update.passwordHash = await bcrypt.hash(password, 10)
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!user) return res.status(404).json({ message: 'Not found' })
  res.json({ id: user._id.toString(), email: user.email, name: user.name, role: user.role, createdAt: user.createdAt })
})

app.delete('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

const upload = multer()

app.get('/people', authMiddleware, async (req, res) => {
  const { search = '', listType } = req.query
  const q = {}
  if (listType === 'whitelist' || listType === 'blacklist') q.listType = listType
  if (search) q.name = { $regex: String(search), $options: 'i' }
  const people = await Person.find(q).lean()
  res.json(people.map(p => ({
    id: p._id.toString(),
    name: p.name,
    listType: p.listType,
    photoFileId: p.photoFileId.toString(),
    createdBy: p.createdBy?.toString() || '',
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  })))
})

app.post('/people', authMiddleware, upload.single('photo'), async (req, res) => {
  const { name, listType } = req.body
  let photoBuffer = null
  if (req.file && req.file.buffer) {
    photoBuffer = req.file.buffer
  } else if (req.body.photoBase64) {
    const base64 = String(req.body.photoBase64).replace(/^data:.+;base64,/, '')
    photoBuffer = Buffer.from(base64, 'base64')
  }
  if (!photoBuffer) return res.status(400).json({ message: 'Photo required' })
  const uploadStream = gridfsBucket.openUploadStream(`${name || 'person'}.jpg`, { contentType: 'image/jpeg' })
  uploadStream.end(photoBuffer)
  uploadStream.on('error', () => res.status(500).json({ message: 'Photo upload error' }))
  uploadStream.on('finish', async file => {
    const person = await Person.create({
      name,
      listType: listType === 'blacklist' ? 'blacklist' : 'whitelist',
      photoFileId: file._id,
      createdBy: new ObjectId(req.user.id),
      createdAt: new Date(),
      updatedAt: new Date()
    })
    res.status(201).json({ id: person._id.toString() })
  })
})

app.patch('/people/:id', authMiddleware, async (req, res) => {
  const { name, listType } = req.body
  const update = {}
  if (name) update.name = name
  if (listType) update.listType = listType === 'blacklist' ? 'blacklist' : 'whitelist'
  update.updatedAt = new Date()
  const person = await Person.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!person) return res.status(404).json({ message: 'Not found' })
  res.json({
    id: person._id.toString(),
    name: person.name,
    listType: person.listType,
    photoFileId: person.photoFileId.toString(),
    createdBy: person.createdBy?.toString() || '',
    createdAt: person.createdAt,
    updatedAt: person.updatedAt
  })
})

app.delete('/people/:id', authMiddleware, async (req, res) => {
  const person = await Person.findById(req.params.id)
  if (person?.photoFileId) {
    try { await gridfsBucket.delete(person.photoFileId) } catch {}
  }
  await Person.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

app.get('/people/:id/photo', authMiddleware, async (req, res) => {
  const person = await Person.findById(req.params.id)
  if (!person) return res.status(404).json({ message: 'Not found' })
  res.setHeader('Content-Type', 'image/jpeg')
  const stream = gridfsBucket.openDownloadStream(person.photoFileId)
  stream.on('error', () => res.status(404).end())
  stream.pipe(res)
})

app.get('/logs', authMiddleware, adminOnly, async (req, res) => {
  const logs = await AccessLog.find().lean()
  res.json(logs.map(l => ({
    id: l._id.toString(),
    personId: l.personId?.toString() || '',
    action: l.action,
    timestamp: l.timestamp,
    userId: l.userId?.toString() || ''
  })))
})

app.post('/logs', authMiddleware, async (req, res) => {
  const { personId, action } = req.body
  const log = await AccessLog.create({
    personId: new ObjectId(String(personId)),
    action: action === 'access_denied' ? 'access_denied' : 'access_granted',
    timestamp: new Date(),
    userId: new ObjectId(req.user.id)
  })
  res.status(201).json({ id: log._id.toString() })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
})
