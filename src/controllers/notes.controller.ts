import { RequestHandler } from "express";
import NoteModel from "../models/note.model";
import noteService from "../services/notes.service";

const getAllNotes: RequestHandler = async (req, res) => {
    const userId = req.query.userId as string;
    try {
        if (!userId) {
            return res.status(400).send({
                ok: false,
                message: 'Missing userId query parameter'
            });
        }
        const notes = await noteService.getAllNotes(userId);
        return res.status(200).send({
            ok: true,
            message: 'Notes retrieved successfully',
            data: notes
        });
    } catch (err: any) {
        return res.status(500).send({
            ok: false,
            message: 'Internal server error',
            error: err.message ? err.message : err
        });
    }
};

const createNote: RequestHandler = async (req, res) => {
    const { title, content , userId} = req.body;
    try {
        if (!title || !content || !userId) {
            return res.status(400).send({
                ok: false,
                message: 'Missing required fields'
            });
        }
        const newNote = await NoteModel.create({
            ...req.body
        });

        return res.status(201).send({
            ok: true,
            message: 'Note created successfully',
            data: newNote
        });
    } catch (err: any) {
        return res.status(500).send({
            ok: false,
            message: 'Internal server error',
            error: err.message ? err.message : err
        });
    }
};

const noteController = {
    createNote,
    getAllNotes
};

export default noteController;