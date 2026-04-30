from fastapi import FastAPI

app = FastAPI(title="Nexus API", description="releitura do P2App")

@app.get("/")
def read_root():
    return {"message": "Nexus API rodando!"}
