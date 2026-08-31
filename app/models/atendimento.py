from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, CheckConstraint, func
from sqlalchemy.orm import relationship

from app.database import Base


class Atendimento(Base):
    __tablename__ = "atendimentos"
    __table_args__ = (
        CheckConstraint(
            "status IN ('planejado', 'em_andamento', 'concluido', 'cancelado')",
            name="ck_atendimentos_status_valid",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("chamados.id", ondelete="CASCADE"), nullable=False, index=True)
    tecnico_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    descricao = Column(Text, nullable=False)
    status = Column(String(30), nullable=False, default="em_andamento", server_default="em_andamento")
    data_inicio = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    data_fim = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    ticket = relationship("Ticket", back_populates="atendimentos")
    tecnico = relationship("User", foreign_keys=[tecnico_id])
