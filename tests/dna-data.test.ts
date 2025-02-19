import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for DNA records
const dnaRecords = new Map()
let nextDnaId = 1

// Mock functions to simulate contract behavior
function submitDnaData(encryptedData: string, metadata: string, sender: string) {
  const dnaId = nextDnaId++
  dnaRecords.set(dnaId, { owner: sender, encryptedData, metadata, lastUpdated: Date.now() })
  return dnaId
}

function updateDnaData(dnaId: number, encryptedData: string, metadata: string, sender: string) {
  const record = dnaRecords.get(dnaId)
  if (!record) throw new Error("Record not found")
  if (record.owner !== sender) throw new Error("Not owner")
  record.encryptedData = encryptedData
  record.metadata = metadata
  record.lastUpdated = Date.now()
  dnaRecords.set(dnaId, record)
  return true
}

function getDnaMetadata(dnaId: number) {
  const record = dnaRecords.get(dnaId)
  if (!record) throw new Error("Record not found")
  return record.metadata
}

function getDnaOwner(dnaId: number) {
  const record = dnaRecords.get(dnaId)
  if (!record) throw new Error("Record not found")
  return record.owner
}

describe("DNA Data Contract", () => {
  beforeEach(() => {
    dnaRecords.clear()
    nextDnaId = 1
  })
  
  it("should submit DNA data", () => {
    const dnaId = submitDnaData("encrypted123", "metadata123", "user1")
    expect(dnaId).toBe(1)
    expect(dnaRecords.size).toBe(1)
    const record = dnaRecords.get(1)
    expect(record.encryptedData).toBe("encrypted123")
    expect(record.metadata).toBe("metadata123")
    expect(record.owner).toBe("user1")
  })
  
  it("should update DNA data", () => {
    const dnaId = submitDnaData("encrypted123", "metadata123", "user1")
    const result = updateDnaData(dnaId, "newencrypted", "newmetadata", "user1")
    expect(result).toBe(true)
    const updatedRecord = dnaRecords.get(dnaId)
    expect(updatedRecord.encryptedData).toBe("newencrypted")
    expect(updatedRecord.metadata).toBe("newmetadata")
  })
  
  it("should not allow non-owner to update DNA data", () => {
    const dnaId = submitDnaData("encrypted123", "metadata123", "user1")
    expect(() => updateDnaData(dnaId, "newencrypted", "newmetadata", "user2")).toThrow("Not owner")
  })
  
  it("should get DNA metadata", () => {
    const dnaId = submitDnaData("encrypted123", "metadata123", "user1")
    const metadata = getDnaMetadata(dnaId)
    expect(metadata).toBe("metadata123")
  })
  
  it("should get DNA owner", () => {
    const dnaId = submitDnaData("encrypted123", "metadata123", "user1")
    const owner = getDnaOwner(dnaId)
    expect(owner).toBe("user1")
  })
})

