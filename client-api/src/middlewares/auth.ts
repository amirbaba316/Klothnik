import { UnauthorizedError } from '@hyperflake/http-errors';
import jwt from 'jsonwebtoken';
import { IUser, User } from '@klothnick/shared/models';
import { UserStatusEnum } from '@klothnick/shared/enums';

export default async (req: any, res: any, next: any) => {
    const authHeader = req.header('authorization');

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) throw new UnauthorizedError(`Unauthorized Access.`);

    try {
        const payload: any = jwt.verify(token, process.env.JWT_SECRET!);

        const user = await User.findOne({ _id: payload._id, status: { $ne: UserStatusEnum.DELETED } });

        if (!user) throw new UnauthorizedError(`Unauthorized Access.`);

        if (user.status === UserStatusEnum.DISABLED)
            throw new UnauthorizedError(`Your login has been disabled. Please contact your support.`);

        req.user = user;

        next();
    } catch (ex) {
        throw new UnauthorizedError(`Unauthorized Access.`);
    }
};
