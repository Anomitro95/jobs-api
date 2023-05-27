const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userId }).sort("createdAt");
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  });
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};
const createJob = async (req, res) => {
  //user object was attached to the req in authentication middleware after successfully verifying the jwt token
  //adding createdBy property to req.body and setting it to user model id to create job for that user
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  //destructure everything, get company and postiion from req.body
  //get userId from user object we set in the authentication middleware as req.user
  //get id from route params and set it as jobId after destructuring from req.params
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  if (company === "" || position === "") {
    throw new BadRequestError("Company or Position fields cannot be empty");
  }

  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );

  if(!job){
    throw new NotFoundError(`No job found with id ${jobId} for user ${req.user.name}`)
  }

  res.status(StatusCodes.OK).json({ job })
};

const deleteJob = async (req, res) => {
    const {
        user: { userId },
        params: { id: jobId },
      } = req;
    
    const job = await Job.findByIdAndRemove({
       _id : jobId,
       createdBy : userId 
    })
    
    if (!job) {
        throw new NotFoundError(`No job with id ${jobId}`);
      }
      res.status(StatusCodes.OK).send(`Successfully deleted job ${jobId}`);


};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
