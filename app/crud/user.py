from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate


def criar_usuario(db: Session, user: UserCreate):
    usuario_existente = db.query(User).filter(User.email == user.email).first()

    if usuario_existente:
        return None

    novo_usuario = User(
        nome=user.nome,
        email=user.email,
        senha=user.senha,
        tipo_usuario=user.tipo_usuario
    )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    return novo_usuario


def listar_usuarios(db: Session):
    return db.query(User).all()