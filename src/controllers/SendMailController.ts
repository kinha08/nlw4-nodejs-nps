import { Request, Response } from "express";
import { resolve } from 'path';
import { getCustomRepository } from "typeorm";
import { Subject } from "typeorm/persistence/Subject";
import { AppError } from "../errors/AppError";
import { SurveyRepository } from "../repositories/SurveyRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UserRepository } from "../repositories/UserRepository";
import SendMailService from "../services/SendMailService";


class SendMailController {
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const surveysUserRepository = getCustomRepository(SurveysUsersRepository);
        const userRepository = getCustomRepository(UserRepository);
        const surveyRepository = getCustomRepository(SurveyRepository);

        const user = await userRepository.findOne({ email })

        if(!user) {
            throw new AppError("User not found");
        }

        const survey = await surveyRepository.findOne({
            id: survey_id
        });

        if(!survey) {
            throw new AppError("Survey not found!");
        }

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

        
        const surveyUsersAlreadyExist = await surveysUserRepository.findOne({
            where: {user_id: user.id, value: null},
            relations: ["user", "survey"]
        });
        
        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL,
        }

        if(surveyUsersAlreadyExist) {
            variables.id = surveyUsersAlreadyExist.id;
            SendMailService.execute(email, survey.title, variables, npsPath);
            return response.json(surveyUsersAlreadyExist);
        }

        // Save survey in table
        const surveyUser = surveysUserRepository.create({
            user_id: user.id,
            survey_id
        });

        console.log(surveyUser)

        await surveysUserRepository.save(surveyUser);

        // Send Email
        variables.id = surveyUser.id;

        await SendMailService.execute(email, survey.title, variables, npsPath);

        return response.status(201).json(surveyUser);
    }

    async show(request: Request, response: Response) {
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
        
        const all = await surveysUsersRepository.find();

        return response.json(all);
    }
}

export { SendMailController };
