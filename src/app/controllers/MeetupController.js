import * as Yup from 'yup'
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns'
import { Op } from 'sequelize'
import Meetup from '../models/Meetup'
import User from '../models/User'

class MeetupController {
  async index(req, res) {
    const where = {}
    const page = req.query.page || 1

    if (req.query.date) {
      const searchDate = parseISO(req.query.date)

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      }
    }

    const meetups = await Meetup.findAll({
      where,
      include: [User],
      limit: 10,
      offset: 10 * page - 10,
    })

    return res.json(meetups)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string()
        .min(3)
        .required(),
      description: Yup.string()
        .min(6)
        .required(),
      location: Yup.string()
        .min(4)
        .required(),
      date: Yup.date().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' })
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Meetup date invalid.' })
    }

    const user_id = req.userId

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    })

    return res.json(meetup)
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      file_id: Yup.number(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' })
    }

    const user_id = req.userId

    const meetup = await Meetup.findByPk(req.params.id)

    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: 'Not authorized.' })
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Meetup date invalid.' })
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't update past meetups." })
    }

    await meetup.update(req.body)

    return res.json(meetup)
  }

  async delete(req, res) {
    const user_id = req.userId

    const meetup = await Meetup.findByPk(req.params.id)

    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: 'Not authorized.' })
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't delete past meetups." })
    }

    await meetup.destroy()

    return res.send()
  }
}

export default new MeetupController()
