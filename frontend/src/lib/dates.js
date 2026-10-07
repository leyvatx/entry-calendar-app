import dayjs from 'dayjs'

export const toApiDateTime = (d) => (d ? d.second(0).millisecond(0).format() : null)

export const fromApiDateTime = (s) => (s ? dayjs(s) : null)
