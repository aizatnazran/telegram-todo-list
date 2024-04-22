const { Telegraf } = require("telegraf")
const { createCanvas, loadImage } = require("canvas")
require("dotenv").config()

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

bot.start((ctx) => ctx.reply("Telegram To-Do Bot is online!"))

const toDoList = {}

function updateIds(userTodos) {
  userTodos.forEach((todo, index) => {
    todo.id = index + 1
  })
}

bot.command("add", (ctx) => {
  const args = ctx.message.text.split(" ").slice(1)
  const task = args[0]
  const description = args.slice(1).join(" ")
  if (!toDoList[ctx.from.id]) {
    toDoList[ctx.from.id] = []
  }
  const id = toDoList[ctx.from.id].length + 1
  toDoList[ctx.from.id].push({ id, task, description })
  ctx.reply(`Added todo "${task}" with ID ${id}`)
})

bot.command("list", (ctx) => {
  if (!toDoList[ctx.from.id] || toDoList[ctx.from.id].length === 0) {
    ctx.reply("Your to-do list is currently empty.")
  } else {
    const list = toDoList[ctx.from.id]
      .map((todo) => `${todo.id}. ${todo.task}`)
      .join("\n")
    ctx.reply(`To-do Lists\n${list}`)
  }
})

bot.command("delete", (ctx) => {
  if (!toDoList[ctx.from.id]) {
    ctx.reply("Your to-do list is empty.")
    return
  }
  const idToDelete = parseInt(ctx.message.text.split(" ")[1])
  if (toDoList[ctx.from.id].length >= idToDelete) {
    toDoList[ctx.from.id].splice(idToDelete - 1, 1)
    updateIds(toDoList[ctx.from.id])
    ctx.reply(`Deleted todo with ID ${idToDelete}`)
  } else {
    ctx.reply("Could not find a todo with that ID.")
  }
})

bot.command("edit", (ctx) => {
  const args = ctx.message.text.split(" ").slice(1)
  const idToEdit = parseInt(args[0])
  if (idToEdit <= toDoList[ctx.from.id].length) {
    const newTask = args[1]
    const newDescription = args.slice(2).join(" ")
    const todo = toDoList[ctx.from.id][idToEdit - 1]
    todo.task = newTask
    todo.description = newDescription
    ctx.reply(`Updated todo with ID ${idToEdit}`)
  } else {
    ctx.reply("Could not find a todo with that ID.")
  }
})

bot.command("view", (ctx) => {
  const idToView = parseInt(ctx.message.text.split(" ")[1])
  if (idToView <= toDoList[ctx.from.id].length) {
    const todo = toDoList[ctx.from.id][idToView - 1]
    ctx.reply(
      `ID -${todo.id}\nTask - ${todo.task}\nDescription - ${todo.description}`
    )
  } else {
    ctx.reply("Could not find a todo with that ID.")
  }
})

bot.command("help", (ctx) => {
  ctx.reply(`
**To-Do Bot Commands:**
- /add [task] [description] - Adds a new to-do with the given task and description.
- /list - Lists all your current to-dos with their ID and task name.
- /delete [id] - Deletes the to-do with the specified ID.
- /edit [id] [new task] [new description] - Edits the task and description of the to-do with the specified ID.
- /view [id] - Shows the task and description of the to-do with the specified ID.
- /help - Shows this list of commands.

Replace [id] with the actual ID of the to-do, [task] with the name of your task, and [description] with the full description of your to-do.
`)
})

bot.launch()
