const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getGenderFromName(fullName) {
  if (!fullName) return "neutral";
  const firstName = fullName.split(" ")[0].toLowerCase();
  
  const femaleNames = [
    "nitika", "jiya", "patricia", "mary", "linda", "barbara", "elizabeth", "jennifer", "maria", "susan",
    "margaret", "dorothy", "lisa", "nancy", "karen", "betty", "helen", "sandra", "donna", "carol",
    "ruth", "sharon", "michelle", "laura", "sarah", "kimberly", "deborah", "jessica", "shirley",
    "cynthia", "angela", "melissa", "brenda", "amy", "anna", "rebecca", "virginia", "kathleen",
    "pamela", "martha", "debra", "amanda", "stephanie", "carolyn", "christine", "marie", "janet",
    "catherine", "frances", "ann", "joyce", "diane", "alice", "julie", "heather", "teresa", "doris",
    "gloria", "evelyn", "jean", "cheryl", "mildred", "katherine", "joan", "ashley", "judith", "rose",
    "janice", "kelly", "nicole", "judy", "christina", "kathy", "theresa", "beverly", "denise", "tammy",
    "irene", "jane", "lori", "rachel", "marilyn", "andrea", "kathryn", "louise", "sara", "anne",
    "jacqueline", "wanda", "bonnie", "julia", "ruby", "lois", "tina", "phyllis", "norma", "paula",
    "diana", "annie", "lillian", "emily", "robin",
    "priya", "neha", "pooja", "anjali", "shruti", "swati", "sneha", "divya", "shikha", "shilpa",
    "kavita", "sunita", "meena", "geeta", "rekha", "rani", "jyoti", "nisha", "radha", "sita",
    "sonia", "ritu", "simran", "kajal", "mamta", "renu", "monika", "pinky", "preeti", "vandana",
    "aarti", "poonam", "sarita", "kiran", "deepa", "anju", "seema", "neelam", "asha", "usha"
  ];
  
  const maleNames = [
    "prince", "raj", "john", "james", "robert", "michael", "william", "david", "richard", "charles",
    "joseph", "thomas", "christopher", "daniel", "paul", "mark", "donald", "george", "kenneth", "steven",
    "edward", "brian", "ronald", "anthony", "kevin", "jason", "matthew", "gary", "timothy", "jose",
    "larry", "jeffrey", "frank", "scott", "eric", "stephen", "andrew", "raymond", "gregory", "joshua",
    "jerry", "dennis", "walter", "patrick", "peter", "harold", "douglas", "henry", "carl", "arthur",
    "ryan", "roger", "joe", "juan", "jack", "albert", "jonathan", "justin", "terry", "gerald",
    "keith", "samuel", "ralph", "lawrence", "nicholas", "roy", "benjamin", "bruce", "brandon", "adam",
    "harry", "fred", "wayne", "billy", "steve", "louis", "jeremy", "aaron", "randy", "howard",
    "eugene", "carlos", "russell", "bobby", "victor", "martin", "ernest", "phillip", "todd", "jesse",
    "craig", "alan", "shawn", "clarence", "sean", "philip", "chris", "johnny", "earl", "jimmy",
    "amit", "rahul", "rohit", "vikas", "sanjay", "sunil", "ajay", "anil", "praveen", "ravi",
    "sandeep", "manish", "ashok", "vijay", "rajeev", "ramesh", "suresh", "dinesh", "mahesh", "navin",
    "prakash", "deepak", "vikram", "surya", "tarun", "gourav", "sourabh", "vishal", "ankit", "mohit",
    "abhishek", "aditya", "akash", "aman", "amitabh", "anand", "anurag", "arun", "arvind", "ashish"
  ];

  if (femaleNames.includes(firstName)) return "female";
  if (maleNames.includes(firstName)) return "male";
  return "neutral";
}

function getAvatarForName(fullName) {
  const gender = getGenderFromName(fullName);
  let hash = 0;
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const id = Math.abs(hash) % 100;
  
  if (gender === "female") return `https://randomuser.me/api/portraits/women/${id}.jpg`;
  if (gender === "male") return `https://randomuser.me/api/portraits/men/${id}.jpg`;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;
}

async function main() {
  const employees = await prisma.employee.findMany();
  let updated = 0;
  
  for (const emp of employees) {
    const newAvatar = getAvatarForName(emp.fullName);
    
    // We only update if it's currently using the broken liara.run, ui-avatars, empty, or example.com
    if (!emp.avatarUrl || emp.avatarUrl.includes('ui-avatars.com') || emp.avatarUrl.includes('liara.run') || emp.avatarUrl.includes('example.com') || emp.avatarUrl === "") {
      await prisma.employee.update({
        where: { id: emp.id },
        data: { avatarUrl: newAvatar }
      });
      updated++;
      console.log(`Updated avatar for ${emp.fullName} -> ${newAvatar}`);
    }
  }
  
  console.log(`Successfully updated ${updated} employee avatars!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
