from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.rag_engine import rag_engine

router = APIRouter(prefix="/rag", tags=["RAG Knowledge Base"])

class DocumentUploadRequest(BaseModel):
    title: str = Field(..., description="Document file name or title")
    subject: Optional[str] = Field("General Academic", description="Course or subject")
    size: Optional[str] = Field("1.5 MB", description="Document file size")

class GroundedQueryRequest(BaseModel):
    query: str = Field(..., description="Student conceptual question or study query")
    document_ids: Optional[List[str]] = Field(None, description="Optional document filter list")

class FlashcardRequest(BaseModel):
    document_id: Optional[str] = Field(None, description="Document ID to generate flashcards from")

@router.get("/documents")
async def get_documents():
    """
    Returns list of indexed documents in the student's vector knowledge base.
    """
    return {
        "status": "success",
        "count": len(rag_engine.list_documents()),
        "documents": rag_engine.list_documents()
    }

@router.post("/upload")
async def upload_document(req: DocumentUploadRequest):
    """
    Ingests document, performs semantic chunking, and indexes vector embeddings.
    """
    try:
        new_doc = rag_engine.add_document(
            title=req.title,
            subject=req.subject or "General Academic",
            size=req.size or "1.5 MB"
        )
        return {
            "status": "indexed",
            "message": f"Successfully processed and indexed '{req.title}' into dense vector knowledge base.",
            "document": new_doc
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query")
async def query_knowledge_base(req: GroundedQueryRequest):
    """
    Performs grounded semantic retrieval against indexed course material
    and generates an answer strictly backed by source citations.
    """
    try:
        result = rag_engine.query_grounded(
            query=req.query,
            document_ids=req.document_ids
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/flashcards")
async def generate_flashcards(req: FlashcardRequest):
    """
    Generates active-recall revision flashcards from indexed course notes.
    """
    cards = rag_engine.generate_flashcards(req.document_id)
    return {
        "status": "success",
        "flashcards_count": len(cards),
        "flashcards": cards
    }

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """
    Deletes document and purges its vector index from the knowledge base.
    """
    deleted = rag_engine.delete_document(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "deleted", "document_id": doc_id}
