from PIL import Image

def create_robot_frame(wave_position):
    """
    Býr til einn ramma (Image) af pixluðu vélmenni í mismunandi 'wave_position'.
    """
    # Stærðin á myndinni - mjög lítil til að fá pixlað útlit
    width, height = 8, 8
    
    # Búum til nýja mynd (8x8) í Indexed/Paletized mode ('P')
    img = Image.new('P', (width, height), color=0)  # Bakgrunnur = index 0 (svart)
    
    # Smíðum litaplöttu (getur verið allt að 256 litir, en hér höldum við henni einfaldri)
    # Palettan er skilgreind í röð: R, G, B, R, G, B, ...
    palette = [
        0, 0, 0,      # index 0 = svart
        128, 128, 128,  # index 1 = grátt (vélmennið)
        255, 255, 255,  # index 2 = hvítt (augu eða smáatriði)
        0, 255, 0     # index 3 = grænt (bara til dæmis)
    ]
    # Stækka palettu listann upp í 768 stök (256 * 3), fyllum með núllum
    palette += [0]*(768 - len(palette))
    img.putpalette(palette)
    
    # Sækjum pixla-reitinn svo við getum breytt honum beint
    pixels = img.load()
    
    # Teiknum einfalt vélmenni með nokkrum gráum pixlum og hvítum fyrir augu
    # Til einföldunar: (x, y) eru hnit, þar sem (0,0) er efst-vinstra megin.
    
    # Bolur vélmennis (grár index 1)
    for y in range(2, 6):
        for x in range(2, 6):
            pixels[x, y] = 1
    
    # Höfuð (grár index 1)
    for y in range(0, 2):
        for x in range(3, 5):
            pixels[x, y] = 1

    # Augu (hvít index 2)
    pixels[3, 0] = 2
    pixels[4, 0] = 2

    # Fætur (grár index 1)
    # Vinstri fótur
    pixels[2, 6] = 1
    # Hægri fótur
    pixels[5, 6] = 1

    # Búum til handleggina þannig að annar armur hreyfist upp/niður.
    #
    # Vinstri armur (stöðugur)
    pixels[1, 3] = 1
    # Hægri armur (wave_position)
    # wave_position = 0 eða 1 til að skipta á milli tveggja staða
    if wave_position == 0:
        # Armur niðri
        pixels[6, 3] = 1
    else:
        # Armur uppi
        pixels[6, 1] = 1
    
    return img

def main():
    # Búum til nokkra ramma til að líkja eftir veifingu:
    frames = []
    # Skiptum einfaldlega á milli "wave_position = 0" og "wave_position = 1"
    # til að láta handlegg vélsins hreyfast upp og niður.
    
    frames.append(create_robot_frame(wave_position=0))
    frames.append(create_robot_frame(wave_position=1))
    frames.append(create_robot_frame(wave_position=0))
    frames.append(create_robot_frame(wave_position=1))
    
    # Vista sem animeraða GIF
    frames[0].save(
        'my_robot_wave.gif',
        save_all=True,
        append_images=frames[1:],  # aðrir rammar
        duration=300,             # tími (ms) hvers ramma
        loop=0                    # 0 = spila endalaust
    )
    print("Búin að útbúa my_robot_wave.gif!")

if __name__ == "__main__":
    main()
