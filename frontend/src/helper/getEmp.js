import axios from "axios";

export default async function getEmp(idArray) {
  try {
    let userData = [];
    const promises = idArray.map((id) =>
      axios.get(`${import.meta.env.VITE_SERVER_URL}/api/auth/get-user`, {
        params: {
          userId: id,
        },
      })
    );
    const responses = await Promise.all(promises); // Wait for all the requests to complete

    responses.forEach((res) => {
      userData.push(res.data.user);
    });

    return userData;
  } catch (error) {
    console.log(error);
  }
}
