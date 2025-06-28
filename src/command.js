#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import {
  getAllNotes,
  findNotes,
  removeNote,
  removeAllNotes,
  newNote,
} from "./note.js";

import { start } from "./server.js";

const listNotes = (notes) => {
  notes.forEach(({ id, content, tags }) => {
    console.log("id:", id);
    console.log("content:", content);
    console.log("tags:", tags);
    console.log("\n");
  });
};

yargs(hideBin(process.argv))
  .command(
    "new <content>",
    "Create  a new Note",
    (yargs) => {
      return yargs.positional("note", {
        type: "string",
        describe: "Content of the note",
      });
    },
    async (argv) => {
      const tags = argv.tags ? argv.tags.split(",") : [];
      const note = await newNote(argv.content, tags);
      console.log(note);
    }
  )
  .option("tags", {
    alias: "t",
    type: "string",
    description: "Tags for the note",
  })
  .command(
    "all",
    "get all notes",
    () => {},
    async (argv) => {
      const notes = await getAllNotes();
      listNotes(notes);
    }
  )
  .command(
    "find <filter>",
    "get matching notes",
    (yargs) => {
      return yargs.positional("filter", {
        describe:
          "The search term to filter notes by, will be applied to note.content",
        type: "string",
      });
    },
    async (argv) => {
      const matchedNotes = await findNotes(argv.filter);
      listNotes(matchedNotes);
    }
  )
  .command(
    "remove <id>",
    "remove a note by id",
    (yargs) => {
      return yargs.positional("id", {
        type: "number",
        description: "The id of the note you want to remove",
      });
    },
    async (argv) => {
      const id = await removeNote(argv.id);
      if (id) {
        console.log("Note removed: ", id);
      } else {
        console.log("Note not found");
      }
    }
  )
  .command(
    "web [port]",
    "launch website to see notes",
    (yargs) => {
      return yargs.positional("port", {
        describe: "port to bind on",
        default: 5000,
        type: "number",
      });
    },
    async (argv) => {
      const notes = await getAllNotes();
      start(notes, argv.port);
    }
  )
  .command(
    "clean",
    "remove all notes",
    () => {},
    async (argv) => {
      await removeAllNotes();
      console.log("All notes removed. DB reset!");
    }
  )
  .demandCommand(1)
  .parse();
