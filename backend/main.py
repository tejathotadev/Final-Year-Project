from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io

from text_based.text_in_text import (
    encode_character_level,
    decode_character_level,
    encode_homoglyph_level,
    decode_homoglyph_level,
    encode_word_level,
    decode_word_level,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= CHARACTER LEVEL =================

@app.post("/stego/text/character-level/encode")
async def character_encode(
    cover_file: UploadFile,
    secret_text: str = Form(...),
    secret_key: str = Form(...)
):
    cover_text = (await cover_file.read()).decode("utf-8")
    stego = encode_character_level(cover_text, secret_text, secret_key)

    return StreamingResponse(
        io.BytesIO(stego.encode("utf-8")),
        media_type="text/plain",
        headers={
            "Content-Disposition": "attachment; filename=stego_output.txt"
        }
    )


@app.post("/stego/text/character-level/decode")
async def character_decode(
    stego_file: UploadFile,
    secret_key: str = Form(...)
):
    try:        
        stego_text = (await stego_file.read()).decode("utf-8")
        secret = decode_character_level(stego_text,secret_key)
        return {"status": "success", "secret_text": secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ================= HOMOGLYPH LEVEL =================

@app.post("/stego/text/homoglyph/encode")
async def homoglyph_encode(
    cover_file: UploadFile,
    secret_text: str = Form(...)
):
    try:
        cover_text = (await cover_file.read()).decode("utf-8")
        stego = encode_homoglyph_level(cover_text, secret_text)
        return {"status": "success", "stego_text": stego}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/stego/text/homoglyph/decode")
async def homoglyph_decode(stego_file: UploadFile):
    try:        
        stego_text = (await stego_file.read()).decode("utf-8")
        secret = decode_homoglyph_level(stego_text)
        return {"status": "success", "secret_text": secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ================= WORD LEVEL =================

@app.post("/stego/text/word-level/encode")
async def word_encode(
    cover_file: UploadFile,
    secret_text: str = Form(...)
):
    try:
        cover_text = (await cover_file.read()).decode("utf-8")
        stego = encode_word_level(cover_text, secret_text)
        return {"status": "success", "stego_text": stego}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/stego/text/word-level/decode")
async def word_decode(stego_file: UploadFile):
    try:
        stego_text = (await stego_file.read()).decode("utf-8")
        secret = decode_word_level(stego_text)
        return {"status": "success", "secret_text": secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
