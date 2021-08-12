export function randomUsername() {
  const usernames = ["Adolf Hitler", "Joseph Stalin", "Mao Zedong", "Benito Mussolini", "Pol Pot", "Kim Jong-il", "Saddam Hussein", "Robert Mugabe", "Kim Jong-un", "Fidel Castro", "Chiang Kai-shek", "Idi Amin", "Bashar al-Assad", "Ferdinand Marcos", "Kim Il-sung", "Francisco Franco", "Ho Chi Minh", "Muammar al-Gaddafi", "Nikita Khrushchev", "Hun Sen", "Hideki Tōjō", "Pervez Musharraf", "Mobutu Sese Seko", "Jean-Claude Duvalier", "Augusto Pinochet", "Nicolae Ceaușescu", "Suharto", "François Duvalier", "Ruhollah Khomeini", "Wojciech Jaruzelski", "Anastasio Somoza Debayle", "Leonid Brezhnev", "Ante Pavelić", "Mengistu Haile Mariam", "Omar al-Bashir", "Juvénal Habyarimana", "Anastasio Somoza García", "Ziaur Rahman", "Pedro Eugenio Aramburu", "Ion Antonescu", "Yahya Khan", "Hafez al-Assad", "Hu Jintao", "Sani Abacha", "Teodoro Obiang Nguema Mbasogo", "Hissène Habré", "Than Shwe", "António de Oliveira Salazar", "Mahathir Mohamad", "Slobodan Milošević", "Gustavo Rojas Pinilla", "Plaek Phibunsongkhram", "Getúlio Vargas", "Leopoldo Galtieri", "Fulgencio Batista", "Jorge Rafael Videla", "Ne Win", "Jean Kambanda", "Manuel Noriega", "Saparmurat Niyazov", "Islam Karimov", "Park Chung-hee", "Thanom Kittikachorn", "Ayub Khan", "Anand Panyarachun", "Georgios Papadopoulos", "Ioannis Metaxas", "Alejandro Agustín Lanusse", "Emilio Aguinaldo", "Lon Nol", "Ibrahim Babangida", "Miklós Horthy", "Roberto Eduardo Viola", "Juan Carlos Onganía", "Reynaldo Bignone", "Thaksin Shinawatra", "Josefa Iloilo", "Sarit Thanarat", "Artur da Costa e Silva", "Gabriel París Gordillo", "Thawan Thamrongnawasawat", "Kriangsak Chamanan", "Pote Sarasin", "Moussa Dadis Camara", "Daniel arap Moi", "Antonio López de Santa Anna", "Prem Tinsulanonda", "Chatichai Choonhavan", "Surayud Chulanont", "Márcio Melo", "Phraya Phahonphon Phayuhasena", "Sonthi Boonyaratglin", "Chaovarat Chanweerakul", "Humberto de Alencar Castelo Branco", "Abdullah of Saudi Arabia", "Katō Tomosaburō", "Emílio Garrastazu Médici", "Eduardo Lonardi", "Khuang Aphaiwong", "Thanin Kraivichien", "Ernest Shonekan", "Askar Akayev", "Jerry Rawlings", "João Figueiredo", "Yamamoto Gonnohyōe", "Tito Okello", "Emilio Eduardo Massera", "Suchinda Kraprayoon", "Aman Andom", "Hussain Muhammad Ershad", "Frank Bainimarama", "Mohamed Ould Abdel Aziz", "Chalit Pukbhasuk", "Kurmanbek Bakiyev", "Roberto M. Levingston", "Tafari Benti", "Julius Caesar"]
  return usernames[Math.floor(Math.random()*usernames.length)];
}

// dec2hex :: Integer -> String
// i.e. 0-255 -> '00'-'ff'
function dec2hex (dec: number) {
  return dec.toString(16).padStart(2, "0")
}

// generateId :: Integer -> String
export function generateId (len: number) {
  var arr = new Uint8Array((len || 40) / 2)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, dec2hex).join('')
}

export function toNetworkId(id: string) {
  const netPrefix = '8cd51ba4-7cac-41ec-93cc-26ef34045926-';
  return netPrefix + id;
}