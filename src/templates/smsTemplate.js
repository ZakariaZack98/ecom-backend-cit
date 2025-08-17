exports.generateVerificationSms = (name, confirmationLink, expireTime = 5) => {
  const expireTimeText = `${expireTime} minute${expireTime > 1 ? 's' : ''}`;
  return `Hi ${name}, please verify your phone number by clicking on this link: ${confirmationLink}. This link will expire in ${expireTimeText}.`;
}