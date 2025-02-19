import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for research proposals and DNA approvals
const researchProposals = new Map()
const dnaApprovals = new Map()
let nextProposalId = 1

// Mock function to simulate DNA ownership
function getDnaOwner(dnaId: number) {
  // Replace with actual logic to fetch DNA owner
  if (dnaId === 1) return "owner1"
  if (dnaId === 2) return "owner2"
  return "unknown"
}

// Mock functions to simulate contract behavior
function submitProposal(title: string, description: string, requiredSampleSize: number, researcher: string) {
  const proposalId = nextProposalId++
  researchProposals.set(proposalId, {
    researcher,
    title,
    description,
    requiredSampleSize,
    status: "PENDING",
    approvedCount: 0,
  })
  return proposalId
}

function approveProposal(proposalId: number, dnaId: number, dnaOwner: string) {
  const proposal = researchProposals.get(proposalId)
  if (!proposal) throw new Error("Proposal not found")
  if (getDnaOwner(dnaId) !== dnaOwner) throw new Error("Not owner")
  if (dnaApprovals.has(`${proposalId}-${dnaId}`)) throw new Error("Already approved")
  
  dnaApprovals.set(`${proposalId}-${dnaId}`, true)
  proposal.approvedCount++
  if (proposal.approvedCount >= proposal.requiredSampleSize) {
    proposal.status = "APPROVED"
  }
  researchProposals.set(proposalId, proposal)
  return true
}

function getProposal(proposalId: number) {
  return researchProposals.get(proposalId)
}

function checkDnaApproval(proposalId: number, dnaId: number) {
  return dnaApprovals.get(`${proposalId}-${dnaId}`) || false
}

describe("Research Proposal Contract", () => {
  beforeEach(() => {
    researchProposals.clear()
    dnaApprovals.clear()
    nextProposalId = 1
  })
  
  it("should submit a proposal", () => {
    const proposalId = submitProposal("Test Proposal", "Description", 10, "researcher1")
    expect(proposalId).toBe(1)
    const proposal = researchProposals.get(1)
    expect(proposal.title).toBe("Test Proposal")
    expect(proposal.status).toBe("PENDING")
  })
  
  it("should approve a proposal", () => {
    const proposalId = submitProposal("Test Proposal", "Description", 2, "researcher1")
    const result = approveProposal(proposalId, 1, "owner1")
    expect(result).toBe(true)
    expect(checkDnaApproval(proposalId, 1)).toBe(true)
  })
  
  it("should update proposal status when required sample size is reached", () => {
    const proposalId = submitProposal("Test Proposal", "Description", 2, "researcher1")
    approveProposal(proposalId, 1, "owner1")
    approveProposal(proposalId, 2, "owner2")
    const proposal = getProposal(proposalId)
    expect(proposal.status).toBe("APPROVED")
  })
  
  it("should not allow double approval", () => {
    const proposalId = submitProposal("Test Proposal", "Description", 2, "researcher1")
    approveProposal(proposalId, 1, "owner1")
    expect(() => approveProposal(proposalId, 1, "owner1")).toThrow("Already approved")
  })
})

